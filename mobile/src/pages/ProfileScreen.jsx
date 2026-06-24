import React, { useRef, useState } from 'react';
import { FiUser, FiBriefcase, FiPackage, FiCreditCard, FiCheck } from 'react-icons/fi';
import { BASE_URL, mediaUrl } from '../config.js';

const PAYMENT_METHODS = ['Numerário', 'MB Way', 'Multibanco', 'Cartão', 'NFC'];
const PRODUCTS = ['Bolas de Berlim', 'Gelados', 'Acessórios de Praia'];

export default function ProfileScreen({ auth, onClose, onUserUpdate }) {
  const { token, user, vendorId } = auth;
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [nif, setNif] = useState(user?.nif || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [businessName, setBusinessName] = useState(user?.business_name || '');
  const [product, setProduct] = useState(user?.product || '');
  const [pinColor, setPinColor] = useState(user?.pin_color || '#7B61FF');
  const [paymentMethods, setPaymentMethods] = useState(
    user?.payment_methods ? user.payment_methods.split(',').filter(Boolean) : []
  );
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
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
    setInfo('');
    try {
      const data = new FormData();
      if (name !== user.name) data.append('name', name);
      if (email !== user.email) data.append('email', email);
      if (nif !== (user.nif || '')) data.append('nif', nif);
      if (phone !== (user.phone || '')) data.append('phone', phone);
      if (businessName !== (user.business_name || '')) data.append('business_name', businessName);
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
      // O email só muda depois de confirmado no link enviado para o novo endereço
      if (body.pending_email) {
        setEmail(body.email || '');
        setInfo(`Confirma o novo email (${body.pending_email}) na mensagem que enviámos para concluir a alteração.`);
        return;
      }
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
          {info && <div className="info-msg">{info}</div>}

          {/* Dados Pessoais */}
          <div className="profile-section-card">
            <div className="profile-section-header">
              <FiUser className="profile-section-icon" />
              <span className="profile-section-title">Dados Pessoais</span>
            </div>
            <div className="profile-input-group">
              <label className="profile-label">Nome</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="profile-input" />
            </div>
            <div className="profile-input-group">
              <label className="profile-label">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="profile-input" />
              <span className="profile-input-hint">Alterar o email exige confirmação no novo endereço.</span>
            </div>
            <div className="profile-input-group">
              <label className="profile-label">NIF</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={9}
                value={nif}
                onChange={(e) => setNif(e.target.value.replace(/\D/g, ''))}
                className="profile-input"
              />
            </div>
            <div className="profile-input-group">
              <label className="profile-label">Telemóvel</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="profile-input" />
            </div>
          </div>

          {/* Atividade */}
          <div className="profile-section-card">
            <div className="profile-section-header">
              <FiBriefcase className="profile-section-icon" />
              <span className="profile-section-title">Atividade</span>
            </div>
            <div className="profile-input-group">
              <label className="profile-label">Nome da Atividade / Firma</label>
              <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="profile-input" />
            </div>
          </div>

          {/* Produto & Aparência */}
          <div className="profile-section-card">
            <div className="profile-section-header">
              <FiPackage className="profile-section-icon" />
              <span className="profile-section-title">Produto & Aparência</span>
            </div>
            <div className="profile-input-group">
              <label className="profile-label">Tipo de produto</label>
              <select value={product} onChange={(e) => setProduct(e.target.value)} className="profile-input">
                {PRODUCTS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="profile-input-group">
              <label className="profile-label">Cor do pin no mapa</label>
              <input type="color" value={pinColor} onChange={(e) => setPinColor(e.target.value)} className="profile-color-input" />
            </div>
          </div>

          {/* Métodos de Pagamento */}
          <div className="profile-section-card">
            <div className="profile-section-header">
              <FiCreditCard className="profile-section-icon" />
              <span className="profile-section-title">Métodos de Pagamento</span>
            </div>
            <p className="profile-section-desc">Indica quais os métodos que aceitas dos clientes.</p>
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
                    {active && <FiCheck className="profile-chip-check" />}
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
