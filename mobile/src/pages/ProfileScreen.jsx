import React, { useRef, useState } from 'react';
import { FiUser, FiLock, FiCamera, FiCheck, FiChevronDown, FiChevronUp, FiDroplet, FiShoppingBag, FiCreditCard } from 'react-icons/fi';
import { BASE_URL, mediaUrl } from '../config.js';
import ImageCropper from '../components/ImageCropper';
import PinColorPicker from '../components/PinColorPicker';

export default function ProfileScreen({ auth, onClose, onUserUpdate }) {
  const { token, user, vendorId } = auth;
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [nif, setNif] = useState(user?.nif || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [product, setProduct] = useState(user?.product || '');
  const [paymentMethods, setPaymentMethods] = useState(user?.payment_methods ? user.payment_methods.split(',').filter(Boolean) : []);
  const [pinColor, setPinColor] = useState(user?.pin_color || '#7B61FF');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showSecurity, setShowSecurity] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const fileInputRef = useRef(null);

  const PAYMENT_ICONS = {
    'MB Way': <FiCreditCard />,
    'Numerário': <FiCreditCard />,
    'Cartão': <FiCreditCard />,
  };

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
      if (pinColor !== (user.pin_color || '#7B61FF')) data.append('pin_color', pinColor);
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

  const avatarSrc = photoPreview || (user?.profile_photo ? mediaUrl(user.profile_photo) : null);

  return (
    <div className="profile-overlay">
      <div className="profile-sheet">
        <div className="profile-header">
          <div>
            <h2>Editar Perfil</h2>
            <p className="profile-header-subtitle">Personalize sua experiência na plataforma</p>
          </div>
          <button className="btn-icon" onClick={onClose} title="Fechar">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={save} className="profile-form">
          {error && <div className="error-msg">{error}</div>}
          {info && <div className="info-msg">{info}</div>}

          {/* Aparência */}
          <div className="profile-section-card">
            <div className="profile-section-header">
              <FiDroplet className="profile-section-icon" />
              <span className="profile-section-title">Aparência</span>
            </div>
            <div className="profile-photo-section">
              <button
                type="button"
                className="profile-avatar-btn"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Alterar foto de perfil"
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Foto de perfil" className="profile-avatar" />
                ) : (
                  <div className="profile-avatar profile-avatar-placeholder">
                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="profile-avatar-overlay">
                  <FiCamera className="profile-avatar-cam" />
                </div>
              </button>
              <span className="profile-photo-hint">Clica para alterar a foto</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </div>
            <div className="profile-input-group">
              <PinColorPicker value={pinColor} onChange={setPinColor} />
            </div>
            <div className="profile-input-group">
              <label className="profile-label">Produto</label>
              <select
                className="profile-input"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              >
                <option value="">Seleciona um produto</option>
                <option value="Bolas de Berlim">Bolas de Berlim</option>
                <option value="Gelados">Gelados</option>
                <option value="Acessórios de Praia">Acessórios de Praia</option>
              </select>
            </div>
            <div className="profile-input-group">
              <label className="profile-label">Métodos de pagamento aceites</label>
              <div className="profile-payment-grid">
                {Object.keys(PAYMENT_ICONS).map((method) => (
                  <button
                    type="button"
                    key={method}
                    className={`profile-payment-chip${paymentMethods.includes(method) ? ' active' : ''}`}
                    onClick={() => togglePaymentMethod(method)}
                  >
                    <span className="profile-payment-chip-icon">{PAYMENT_ICONS[method]}</span>
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dados Pessoais */}
          <div className="profile-section-card">
            <div className="profile-section-header">
              <FiUser className="profile-section-icon" />
              <span className="profile-section-title">Dados Pessoais</span>
            </div>
            <div className="profile-input-group">
              <label className="profile-label">Nome completo</label>
              <input
                className="profile-input"
                type="text"
                placeholder="O teu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="profile-input-group">
              <label className="profile-label">Email</label>
              <input
                className="profile-input"
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {user.pending_email ? (
                <span className="profile-input-hint">
                  Alteração pendente: confirma <strong>{user.pending_email}</strong> no email que enviámos.
                </span>
              ) : (
                <span className="profile-input-hint">
                  Ao alterar o email vais receber um link de confirmação no novo endereço.
                </span>
              )}
            </div>
            <div className="profile-input-group">
              <label className="profile-label">NIF</label>
              <input
                className="profile-input"
                type="text"
                inputMode="numeric"
                maxLength={9}
                placeholder="123456789"
                value={nif}
                onChange={(e) => setNif(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div className="profile-input-group">
              <label className="profile-label">Telemóvel</label>
              <input
                className="profile-input"
                type="tel"
                placeholder="912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Segurança */}
          <div className="profile-section-card">
            <button
              type="button"
              className="profile-section-header profile-section-toggle"
              onClick={() => setShowSecurity(v => !v)}
              aria-expanded={showSecurity}
            >
              <span className="profile-section-header-left">
                <FiLock className="profile-section-icon" />
                <span className="profile-section-title">Segurança</span>
              </span>
              {showSecurity ? <FiChevronUp className="profile-toggle-icon" /> : <FiChevronDown className="profile-toggle-icon" />}
            </button>
            {showSecurity && (
              <div className="profile-section-body">
                <div className="profile-input-group">
                  <label className="profile-label">Palavra-passe atual</label>
                  <input
                    className="profile-input"
                    type="password"
                    placeholder="Palavra-passe atual"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <div className="profile-input-group">
                  <label className="profile-label">Nova palavra-passe</label>
                  <input
                    className="profile-input"
                    type="password"
                    placeholder="Mínimo 8 caracteres, maiúscula e número"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
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
