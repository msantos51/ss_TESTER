# templates.py - páginas HTML servidas pelo backend (fora da SPA).
#
# São as páginas a que os links dos emails levam: o resultado da confirmação
# de email e o formulário de redefinição da palavra-passe.


def status_page(
    title: str,
    icon: str,
    heading: str,
    heading_color: str,
    message: str,
    button_label: str,
    button_href: str = "/",
) -> str:
    """Render a branded full-page status card (used for email confirmation results)."""
    return f"""<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <title>{title}</title>
    <style>
        * {{ box-sizing: border-box; }}
        body {{ font-family: 'Roboto', sans-serif; background: #f4f4f4; margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }}
        .card {{ background: #fff; border-radius: 12px; max-width: 440px; width: 100%; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }}
        .card-header {{ background: linear-gradient(135deg,#FCB454,#F7931E); padding: 28px; text-align: center; }}
        .card-header h1 {{ margin: 0; color: #fff; font-size: 22px; }}
        .card-body {{ padding: 36px 32px; text-align: center; }}
        .card-body .icon {{ font-size: 46px; line-height: 1; }}
        .card-body h2 {{ color: {heading_color}; margin: 14px 0 10px; font-size: 21px; }}
        .card-body p {{ color: #555; font-size: 15px; line-height: 1.6; margin: 0; }}
        .card-body a {{ display: inline-block; margin-top: 24px; background: #FCB454; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; transition: background .15s; }}
        .card-body a:hover {{ background: #F7931E; }}
    </style>
</head>
<body>
    <div class="card">
        <div class="card-header"><h1>&#9728;&#65039; Sunny Sales</h1></div>
        <div class="card-body">
            <div class="icon">{icon}</div>
            <h2>{heading}</h2>
            <p>{message}</p>
            <a href="{button_href}">{button_label}</a>
        </div>
    </div>
</body>
</html>"""


def password_reset_form(token: str) -> str:
    """Formulário de escolha de nova palavra-passe (destino do link do email)."""
    return f"""<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <title>Redefinir Palavra-passe</title>
    <style>
        * {{ box-sizing: border-box; }}
        body {{ font-family: 'Roboto', sans-serif; background: #f4f4f4; margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }}
        .card {{ background: #fff; border-radius: 12px; max-width: 440px; width: 100%; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }}
        .card-header {{ background: linear-gradient(135deg,#FCB454,#F7931E); padding: 28px; text-align: center; }}
        .card-header h1 {{ margin: 0; color: #fff; font-size: 22px; }}
        .card-body {{ padding: 32px; }}
        .card-body h2 {{ color: #333; margin: 0 0 8px; font-size: 20px; }}
        .card-body p.intro {{ color: #555; font-size: 15px; line-height: 1.6; margin-top: 0; }}
        .field {{ position: relative; margin-bottom: 16px; }}
        .field label {{ display: block; color: #444; font-size: 13px; font-weight: 500; margin-bottom: 6px; }}
        .field input {{ width: 100%; padding: 12px 44px 12px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 15px; font-family: inherit; }}
        .field input:focus {{ outline: none; border-color: #FCB454; box-shadow: 0 0 0 3px rgba(252,180,84,0.2); }}
        .toggle {{ position: absolute; right: 12px; top: 33px; background: none; border: none; cursor: pointer; color: #888; font-size: 13px; padding: 4px; }}
        .hint {{ color: #888; font-size: 12px; margin: -6px 0 18px; line-height: 1.5; }}
        button.submit {{ width: 100%; padding: 13px; background: #FCB454; color: #fff; border: none; border-radius: 8px; font-size: 16px; font-weight: 700; cursor: pointer; transition: background .15s; }}
        button.submit:hover {{ background: #F7931E; }}
        button.submit:disabled {{ background: #e6c79a; cursor: not-allowed; }}
        .msg {{ border-radius: 8px; padding: 12px 14px; font-size: 14px; margin-bottom: 16px; display: none; }}
        .msg.error {{ background: #fdecea; color: #c62828; display: block; }}
        .msg.success {{ background: #e8f5e9; color: #2e7d32; display: block; }}
        .done {{ text-align: center; }}
        .done .icon {{ font-size: 44px; }}
        .done a {{ display: inline-block; margin-top: 20px; background: #FCB454; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; }}
    </style>
</head>
<body>
    <div class="card">
        <div class="card-header"><h1>&#9728;&#65039; Sunny Sales</h1></div>
        <div class="card-body" id="content">
            <h2>Redefinir Palavra-passe</h2>
            <p class="intro">Escolhe uma nova palavra-passe para a tua conta.</p>
            <div class="msg" id="msg"></div>
            <form id="reset-form" action="/password-reset/{token}" method="post">
                <div class="field">
                    <label for="new_password">Nova palavra-passe</label>
                    <input type="password" id="new_password" name="new_password" placeholder="Nova palavra-passe" required>
                    <button type="button" class="toggle" data-target="new_password">Mostrar</button>
                </div>
                <div class="field">
                    <label for="confirm_password">Confirmar palavra-passe</label>
                    <input type="password" id="confirm_password" name="confirm_password" placeholder="Repete a palavra-passe" required>
                    <button type="button" class="toggle" data-target="confirm_password">Mostrar</button>
                </div>
                <p class="hint">Mínimo de 8 caracteres, com pelo menos uma letra maiúscula e um número.</p>
                <button type="submit" class="submit" id="submit-btn">Redefinir Palavra-passe</button>
            </form>
        </div>
    </div>
    <script>
        document.querySelectorAll('.toggle').forEach(function (btn) {{
            btn.addEventListener('click', function () {{
                var input = document.getElementById(btn.dataset.target);
                if (input.type === 'password') {{ input.type = 'text'; btn.textContent = 'Ocultar'; }}
                else {{ input.type = 'password'; btn.textContent = 'Mostrar'; }}
            }});
        }});

        var form = document.getElementById('reset-form');
        var msg = document.getElementById('msg');
        var btn = document.getElementById('submit-btn');

        function showMsg(text, type) {{ msg.textContent = text; msg.className = 'msg ' + type; }}

        function valid(pw) {{ return pw.length >= 8 && pw.toLowerCase() !== pw && /\\d/.test(pw); }}

        form.addEventListener('submit', async function (e) {{
            e.preventDefault();
            var pw = document.getElementById('new_password').value;
            var confirm = document.getElementById('confirm_password').value;
            if (!valid(pw)) {{
                showMsg('A palavra-passe deve ter pelo menos 8 caracteres, uma letra maiúscula e um número.', 'error');
                return;
            }}
            if (pw !== confirm) {{
                showMsg('As palavras-passe não coincidem.', 'error');
                return;
            }}
            btn.disabled = true;
            btn.textContent = 'A redefinir...';
            try {{
                var body = new URLSearchParams();
                body.append('new_password', pw);
                var resp = await fetch(form.action, {{ method: 'POST', body: body }});
                if (resp.ok) {{
                    document.getElementById('content').innerHTML =
                        '<div class="done"><div class="icon">&#9989;</div>' +
                        '<h2>Palavra-passe alterada!</h2>' +
                        '<p class="intro">A tua palavra-passe foi redefinida com sucesso. J&aacute; podes iniciar sess&atilde;o com a nova palavra-passe.</p>' +
                        '<a href="/">Ir para a p&aacute;gina inicial</a></div>';
                }} else {{
                    var data = await resp.json().catch(function () {{ return {{}}; }});
                    showMsg(data.detail || 'Este link j&aacute; n&atilde;o &eacute; v&aacute;lido ou expirou. Pede um novo email de recupera&ccedil;&atilde;o.', 'error');
                    btn.disabled = false;
                    btn.textContent = 'Redefinir Palavra-passe';
                }}
            }} catch (err) {{
                showMsg('Ocorreu um erro de liga&ccedil;&atilde;o. Tenta novamente.', 'error');
                btn.disabled = false;
                btn.textContent = 'Redefinir Palavra-passe';
            }}
        }});
    </script>
</body>
</html>"""
