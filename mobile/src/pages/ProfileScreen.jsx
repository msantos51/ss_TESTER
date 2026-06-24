import React, { useRef, useState } from 'react';
import { FiUser, FiLock, FiDroplet, FiCheck } from 'react-icons/fi';
import { BASE_URL, mediaUrl } from '../config.js';

export default function ProfileScreen({ auth, onClose, onUserUpdate }) {
  const { token, user, vendorId } = auth;
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [nif, setNif] = useState(user?.nif || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [pinColor, setPinColor] = useState(user?.pin_color || '#7B61FF');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
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
      if (pinColor !== (user.pin_color || '#7B61FF')) data.append('pin_color', pinColor);
      if (newPassword) {
        data.append('new_password', newPassword);
        data.append('old_password', oldPassword);
      }
      if (photo) data.append('profile_photo', photo);

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
      setOldPassword('');
      setNewPassword('');
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
            <div className="profile-input-group">
              <label className="profile-label">Cor do pin no mapa</label>
              <input type="color" value={pinColor} onChange={(e) => setPinColor(e.target.value)} className="profile-color-input" />
            </div>
          </div>

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

          {/* Segurança */}
          <div className="profile-section-card">
            <div className="profile-section-header">
              <FiLock className="profile-section-icon" />
              <span className="profile-section-title">Segurança</span>
            </div>
            <div className="profile-input-group">
              <label className="profile-label">Palavra-passe atual</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Deixa em branco se não queres alterar"
                className="profile-input"
                autoComplete="current-password"
              />
            </div>
            <div className="profile-input-group">
              <label className="profile-label">Nova palavra-passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres, maiúscula e número"
                className="profile-input"
                autoComplete="new-password"
              />
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
