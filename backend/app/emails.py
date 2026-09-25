# emails.py - envio de email transacional (via Resend) e respetivos modelos.

from html import escape

import httpx

from .config import BASE_APP_URL, RESEND_API_KEY, RESEND_FROM


def send_email(to: str, subject: str, body: str, html: str | None = None) -> bool:
    """Send an email via Resend. Returns True if sent, False if Resend not configured."""
    if not RESEND_API_KEY:
        print(f"[Email] Resend não configurado. Para: {to}\nAssunto: {subject}")
        return False

    response = httpx.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
        json={
            "from": RESEND_FROM,
            "to": [to],
            "subject": subject,
            "text": body,
            **({"html": html} if html else {}),
        },
        timeout=15,
    )
    response.raise_for_status()
    return True


def send_confirmation_email(name: str, email: str, confirmation_token: str) -> bool:
    confirm_link = f"{BASE_APP_URL}/confirm-email/{confirmation_token}"
    try:
        return send_email(
            to=email,
            subject="Sunny Sales - Confirma o teu email",
            body=f"Olá {name},\n\nObrigado por te registares na Sunny Sales!\n\nClica no link para confirmares a tua conta:\n{confirm_link}\n\nSe não criaste esta conta, ignora este email.\n\nCumprimentos,\nEquipa Sunny Sales",
            html=f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#FCB454,#F7931E);padding:30px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;">&#9728;&#65039; Sunny Sales</h1>
        </td></tr>
        <tr><td style="padding:30px;">
          <h2 style="color:#333;margin-top:0;">Olá {escape(name or '')}!</h2>
          <p style="color:#555;font-size:16px;line-height:1.6;">Obrigado por te registares na <strong>Sunny Sales</strong>. Para ativares a tua conta, confirma o teu email clicando no botão abaixo:</p>
          <div style="text-align:center;margin:30px 0;">
            <a href="{confirm_link}" style="background:#FCB454;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">Confirmar Email</a>
          </div>
          <p style="color:#888;font-size:13px;">Se o botão não funcionar, copia e cola este link no teu navegador:</p>
          <p style="color:#888;font-size:13px;word-break:break-all;">{confirm_link}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
          <p style="color:#aaa;font-size:12px;text-align:center;">Se não criaste esta conta, ignora este email.<br>Equipa Sunny Sales</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>""",
        )
    except Exception as exc:
        print(f"[Email] Falha ao enviar email de confirmação para {email}: {exc}")
        return False


def send_email_change_confirmation(name: str, new_email: str, change_token: str) -> bool:
    """Envia para o NOVO email um link para confirmar a alteração de email."""
    confirm_link = f"{BASE_APP_URL}/confirm-email-change/{change_token}"
    try:
        return send_email(
            to=new_email,
            subject="Sunny Sales - Confirma o teu novo email",
            body=f"Olá {name},\n\nPediste para alterar o email da tua conta Sunny Sales para este endereço.\n\nClica no link para confirmares a alteração:\n{confirm_link}\n\nSe não pediste esta alteração, ignora este email.\n\nCumprimentos,\nEquipa Sunny Sales",
            html=f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#FCB454,#F7931E);padding:30px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;">&#9728;&#65039; Sunny Sales</h1>
        </td></tr>
        <tr><td style="padding:30px;">
          <h2 style="color:#333;margin-top:0;">Olá {escape(name or '')}!</h2>
          <p style="color:#555;font-size:16px;line-height:1.6;">Pediste para alterar o email da tua conta <strong>Sunny Sales</strong> para este endereço. Para confirmares a alteração, clica no botão abaixo:</p>
          <div style="text-align:center;margin:30px 0;">
            <a href="{confirm_link}" style="background:#FCB454;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">Confirmar Novo Email</a>
          </div>
          <p style="color:#888;font-size:13px;">Se o botão não funcionar, copia e cola este link no teu navegador:</p>
          <p style="color:#888;font-size:13px;word-break:break-all;">{confirm_link}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
          <p style="color:#aaa;font-size:12px;text-align:center;">Se não pediste esta alteração, ignora este email.<br>Equipa Sunny Sales</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>""",
        )
    except Exception as exc:
        print(f"[Email] Falha ao enviar email de alteração para {new_email}: {exc}")
        return False


def send_password_reset_email(name: str, email: str, reset_token: str) -> bool:
    reset_link = f"{BASE_APP_URL}/password-reset/{reset_token}"
    try:
        return send_email(
            to=email,
            subject="Sunny Sales - Redefinir Palavra-passe",
            body=f"Olá {name},\n\nRecebemos um pedido para redefinir a palavra-passe da tua conta Sunny Sales.\n\nClica no link para definires uma nova palavra-passe (válido durante 2 horas):\n{reset_link}\n\nSe não pediste esta alteração, ignora este email.\n\nCumprimentos,\nEquipa Sunny Sales",
            html=f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#FCB454,#F7931E);padding:30px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;">&#9728;&#65039; Sunny Sales</h1>
        </td></tr>
        <tr><td style="padding:30px;">
          <h2 style="color:#333;margin-top:0;">Olá {escape(name or '')}!</h2>
          <p style="color:#555;font-size:16px;line-height:1.6;">Recebemos um pedido para redefinir a palavra-passe da tua conta <strong>Sunny Sales</strong>. Clica no botão abaixo para definires uma nova palavra-passe:</p>
          <div style="text-align:center;margin:30px 0;">
            <a href="{reset_link}" style="background:#FCB454;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">Redefinir Palavra-passe</a>
          </div>
          <p style="color:#888;font-size:13px;">Este link é válido durante 2 horas. Se o botão não funcionar, copia e cola este link no teu navegador:</p>
          <p style="color:#888;font-size:13px;word-break:break-all;">{reset_link}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
          <p style="color:#aaa;font-size:12px;text-align:center;">Se não pediste esta alteração, ignora este email.<br>Equipa Sunny Sales</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>""",
        )
    except Exception as exc:
        print(f"[Email] Falha ao enviar email de recuperação para {email}: {exc}")
        return False
