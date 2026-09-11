import React, { useRef, useState } from 'react';
import {
  FiLock, FiCamera, FiChevronDown, FiChevronUp,
  FiAlertTriangle, FiDownload, FiTrash2,
} from 'react-icons/fi';
import { BASE_URL, WEB_URL, mediaUrl } from '../config.js';
import ImageCropper from '../components/ImageCropper';
import PinColorPicker from '../components/PinColorPicker';

const PAYMENT_METHODS = ['MB Way', 'Numerário', 'Cartão'];
const DEFAULT_PIN = '#EE9B00';

export default function ProfileScreen({ auth, onClose, onUserUpdate, onAccountDeleted }) {
  const { token, user, vendorId } = auth;
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [nif, setNif] = useState(user?.nif || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [product, setProduct] = useState(user?.product || '');
  const [paymentMethods, setPaymentMethods] = useState(
    user?.payment_methods ? user.payment_methods.split(',').filter(Boolean) : []
  );
  const [pinColor, setPinColor] = useState(user?.pin_color || DEFAULT_PIN);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showSecurity, setShowSecurity] = useState(false);
  const [showDanger, setShowDanger] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dangerError, setDangerError] = useState('');
  const [dangerInfo, setDangerInfo] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const fileInputRef = useRef(null);

  const togglePaymentMethod = (method) => {
    setPaymentMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setCropSrc(URL.createObjectURL(file));
  };

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const handleCropComplete = (blob) => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setPhoto(blob);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(blob));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setInfo('');
    try {
      const data = new FormData();
      if (name !== user.name) data.append('name', name);
      const emailChanged = email !== user.email;
      if (emailChanged) data.append('email', email);
      if (nif !== (user.nif || '')) data.append('nif', nif);
      if (phone !== (user.phone || '')) data.append('phone', phone);
      if (product !== (user.product || '')) data.append('product', product);
      const newPaymentMethods = paymentMethods.join(',');
      if (newPaymentMethods !== (user.payment_methods || '')) data.append('payment_methods', newPaymentMethods);
      if (newPassword) {
        data.append('new_password', newPassword);
        data.append('old_password', oldPassword);
      }
      if (pinColor !== (user.pin_color || DEFAULT_PIN)) data.append('pin_color', pinColor);
      if (photo) data.append('profile_photo', new File([photo], 'profile.jpg', { type: 'image/jpeg' }));

      const res = await fetch(`${BASE_URL}/vendors/${vendorId}/profile`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.detail || 'Erro ao atualizar perfil.');
      onUserUpdate(body);
      if (body.pending_email) {
        setEmail(body.email || '');
        setInfo(`Confirma o novo email (${body.pending_email}) na mensagem que enviámos para concluir a alteração.`);
        return;
      }
      setNewPassword('');
      setOldPassword('');
      setPhoto(null);
      if (photoPreview) { URL.revokeObjectURL(photoPreview); setPhotoPreview(null); }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // (em português) RGPD art. 20.º — descarrega em JSON tudo o que o servidor
  // guarda sobre o vendedor. Em WebView o download por blob nem sempre é
  // permitido, por isso o erro remete para a mesma função na versão web.
  const exportData = async () => {
    setExporting(true);
    setDangerError('');
    setDangerInfo('');
    try {
      const res = await fetch(`${BASE_URL}/vendors/me/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Não foi possível preparar os teus dados.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sunny-sales-dados-${vendorId}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setDangerInfo('Os teus dados foram descarregados em formato JSON.');
    } catch (err) {
      setDangerError(`${err.message} Podes descarregá-los em ${WEB_URL}/eliminar-conta`);
    } finally {
      setExporting(false);
    }
  };

  // (em português) RGPD art. 17.º e requisito obrigatório da Google Play: o
  // utilizador tem de poder eliminar a conta a partir da própria app.
  const deleteAccount = async () => {
    setDeleting(true);
    setDangerError('');
    setDangerInfo('');
    try {
      const res = await fetch(`${BASE_URL}/vendors/me`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: deletePassword }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.detail || 'Não foi possível eliminar a conta.');
      setDeletePassword('');
      onAccountDeleted?.();
    } catch (err) {
      setDangerError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const avatarSrc = photoPreview || (user?.profile_photo ? mediaUrl(user.profile_photo) : null);
  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="ss-sheet-overlay" role="dialog" aria-modal="true" aria-label="Perfil">
      <div className="ss-sheet">
        <span className="ss-sheet-handle" aria-hidden="true" />

        <div className="ss-sheet-head">
          <h2 className="ss-sheet-title">Perfil</h2>
          <button type="button" className="ss-sheet-close" onClick={onClose} aria-label="Fechar">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={save} className="ss-sheet-body">
          {error && <div className="ss-error">{error}</div>}
          {info && <div className="info-msg">{info}</div>}

          {/* Identidade */}
          <div className="profile-card">
            <div className="profile-photo-row">
              <button
                type="button"
                className="profile-avatar-btn"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Alterar foto de perfil"
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt="" className="profile-avatar" />
                ) : (
                  <span className="profile-avatar profile-avatar-initial">{initial}</span>
                )}
                <span className="profile-avatar-overlay"><FiCamera /></span>
              </button>
              <div className="profile-photo-text">
                <span className="profile-photo-title">Foto de perfil</span>
                <span className="profile-photo-hint">Toca para alterar</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </div>

            <div className="ss-field">
              <label className="ss-label" htmlFor="profile-name">Nome</label>
              <input
                id="profile-name"
                className="ss-input"
                type="text"
                placeholder="O teu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <PinColorPicker value={pinColor} onChange={setPinColor} />

            <div className="ss-field">
              <label className="ss-label" htmlFor="profile-product">Produto</label>
              <select
                id="profile-product"
                className="ss-input"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              >
                <option value="">Seleciona um produto</option>
                <option value="Bolas de Berlim">Bolas de Berlim</option>
                <option value="Gelados">Gelados</option>
                <option value="Acessórios de Praia">Acessórios de Praia</option>
              </select>
            </div>

            <div className="ss-field">
              <span className="ss-label">Métodos de pagamento</span>
              <div className="profile-chips">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    type="button"
                    key={method}
                    className={`profile-chip${paymentMethods.includes(method) ? ' is-on' : ''}`}
                    onClick={() => togglePaymentMethod(method)}
                    aria-pressed={paymentMethods.includes(method)}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dados pessoais */}
          <div className="profile-card">
            <span className="profile-card-title">Dados pessoais</span>

            <div className="ss-field">
              <label className="ss-label" htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                className="ss-input"
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {user.pending_email ? (
                <span className="ss-hint">
                  Alteração pendente: confirma <strong>{user.pending_email}</strong> no email que enviámos.
                </span>
              ) : (
                <span className="ss-hint">
                  Ao alterar o email vais receber um link de confirmação no novo endereço.
                </span>
              )}
            </div>

            <div className="ss-field">
              <label className="ss-label" htmlFor="profile-nif">NIF</label>
              <input
                id="profile-nif"
                className="ss-input"
                type="text"
                inputMode="numeric"
                maxLength={9}
                placeholder="123456789"
                value={nif}
                onChange={(e) => setNif(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <div className="ss-field">
              <label className="ss-label" htmlFor="profile-phone">Telemóvel</label>
              <input
                id="profile-phone"
                className="ss-input"
                type="tel"
                placeholder="912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Segurança e RGPD, com a anatomia de lista da Conta */}
          <div className="ss-group-card">
            <button
              type="button"
              className="ss-row"
              onClick={() => setShowSecurity((v) => !v)}
              aria-expanded={showSecurity}
            >
              <span className="ss-row-icon"><FiLock /></span>
              <span className="ss-row-label">Segurança</span>
              {showSecurity
                ? <FiChevronUp className="ss-row-chevron" />
                : <FiChevronDown className="ss-row-chevron" />}
            </button>

            {showSecurity && (
              <div className="ss-row-body">
                <div className="ss-field">
                  <label className="ss-label" htmlFor="profile-old-pass">Palavra-passe atual</label>
                  <input
                    id="profile-old-pass"
                    className="ss-input"
                    type="password"
                    placeholder="Palavra-passe atual"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <div className="ss-field">
                  <label className="ss-label" htmlFor="profile-new-pass">Nova palavra-passe</label>
                  <input
                    id="profile-new-pass"
                    className="ss-input"
                    type="password"
                    placeholder="Mínimo 8 caracteres, maiúscula e número"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              className="ss-row is-danger-icon"
              onClick={() => setShowDanger((v) => !v)}
              aria-expanded={showDanger}
            >
              <span className="ss-row-icon"><FiAlertTriangle /></span>
              <span className="ss-row-label">Os teus dados (RGPD)</span>
              {showDanger
                ? <FiChevronUp className="ss-row-chevron" />
                : <FiChevronDown className="ss-row-chevron" />}
            </button>

            {showDanger && (
              <div className="ss-row-body">
                {dangerError && <div className="ss-error">{dangerError}</div>}
                {dangerInfo && <div className="info-msg">{dangerInfo}</div>}

                <p className="ss-row-text">
                  Podes descarregar tudo o que guardamos sobre ti, ou eliminar a
                  conta em definitivo.
                </p>

                <button
                  type="button"
                  className="ss-btn-outline"
                  onClick={exportData}
                  disabled={exporting}
                >
                  <FiDownload /> {exporting ? 'A preparar…' : 'Descarregar os meus dados'}
                </button>

                {!confirmingDelete ? (
                  <button
                    type="button"
                    className="ss-btn-danger"
                    onClick={() => { setConfirmingDelete(true); setDangerError(''); setDangerInfo(''); }}
                  >
                    <FiTrash2 /> Eliminar a minha conta
                  </button>
                ) : (
                  <>
                    <p className="ss-row-text">
                      Isto apaga em definitivo o teu perfil, trajetos, produtos e
                      stories. O registo dos pagamentos é conservado por obrigação
                      fiscal. <strong>Não há forma de recuperar.</strong>
                    </p>
                    <div className="ss-field">
                      <label className="ss-label" htmlFor="profile-del-pass">
                        Confirma com a tua palavra-passe
                      </label>
                      <input
                        id="profile-del-pass"
                        className="ss-input"
                        type="password"
                        placeholder="Palavra-passe"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        autoComplete="current-password"
                      />
                    </div>
                    <button
                      type="button"
                      className="ss-btn-danger"
                      onClick={deleteAccount}
                      disabled={deleting || !deletePassword}
                    >
                      {deleting ? 'A eliminar…' : 'Eliminar em definitivo'}
                    </button>
                    <button
                      type="button"
                      className="ss-btn-outline"
                      onClick={() => { setConfirmingDelete(false); setDeletePassword(''); }}
                      disabled={deleting}
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <button type="submit" className="ss-btn-primary" disabled={saving}>
            {saving ? 'A guardar…' : 'Guardar alterações'}
          </button>
        </form>
      </div>

      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          onCancel={handleCropCancel}
          onComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
