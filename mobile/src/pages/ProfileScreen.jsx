import React, { useRef, useState } from 'react';
import { BASE_URL, mediaUrl } from '../config.js';

const PAYMENT_METHODS = ['Numerário', 'MB Way', 'Multibanco', 'Cartão', 'NFC'];
const PRODUCTS = ['Bolas de Berlim', 'Gelados', 'Acessórios de Praia'];

export default function ProfileScreen({ auth, onClose, onUserUpdate }) {
  const { token, user, vendorId } = auth;
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [product, setProduct] = useState(user?.product || '');
  const [pinColor, setPinColor] = useState(user?.pin_color || '#7B61FF');
  const [paymentMethods, setPaymentMethods] = useState(
    user?.payment_methods ? user.payment_methods.split(',').filter(Boolean) : []
  );
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const togglePayment = (id) => {
    setPaymentMethods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const data = new FormData();
      if (name !== user.name) data.append('name', name);
      if (email !== user.email) data.append('email', email);
      if (product !== user.product) data.append('product', product);
      if (pinColor !== (user.pin_color || '#7B61FF')) data.append('pin_color', pinColor);
      const newMethods = paymentMethods.join(',');
      if (newMethods !== (user.payment_methods || '')) data.append('payment_methods', newMethods);
      if (photo) data.append('profile_photo', photo);

      const res = await fetch(`${BASE_URL}/vendors/${vendorId}/profile`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.detail || 'Erro ao atualizar perfil.');
      onUserUpdate(body);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = photoPreview || mediaUrl(user?.profile_photo);

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
          <div className="profile-photo-section">
            <button
              type="button"
              className="profile-avatar-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt="Foto de perfil" className="profile-avatar" style={{ borderColor: pinColor }} />
              ) : (
                <div className="profile-avatar profile-avatar-placeholder" style={{ borderColor: pinColor, background: `${pinColor}33` }}>
                  {(name || '?').charAt(0).toUpperCase()}
                </div>
              )}
            </button>
            <span className="profile-photo-hint">Toca para alterar a foto</span>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <div className="input-group">
            <label>Nome</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Produto</label>
            <select value={product} onChange={(e) => setProduct(e.target.value)}>
              {PRODUCTS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Cor do pin no mapa</label>
            <input type="color" value={pinColor} onChange={(e) => setPinColor(e.target.value)} className="profile-color-input" />
          </div>
          <div className="profile-section-divider" />

          <div className="input-group">
            <label>Métodos de pagamento aceites</label>
            <div className="profile-payment-grid">
              {PAYMENT_METHODS.map((m) => {
                const active = paymentMethods.includes(m);
                return (
                  <button
                    type="button"
                    key={m}
                    className={`profile-payment-chip${active ? ' active' : ''}`}
                    onClick={() => togglePayment(m)}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'A guardar…' : 'Guardar alterações'}
          </button>
        </form>
      </div>
    </div>
  );
}
