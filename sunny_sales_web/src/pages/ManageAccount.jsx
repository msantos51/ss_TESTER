import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { BASE_URL, mediaUrl } from '../config';
import ImageCropper from '../components/ImageCropper';
import PinColorPicker from '../components/PinColorPicker';
import BackHomeButton from '../components/BackHomeButton';
import {
  FiUser, FiLock, FiCamera, FiCheck,
  FiChevronDown, FiChevronUp, FiSave, FiDroplet, FiAlertCircle,
} from 'react-icons/fi';
import './VendorPage.css';

export default function ManageAccount() {
  const [vendor, setVendor] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nif, setNif] = useState('');
  const [phone, setPhone] = useState('');
  const [pinColor, setPinColor] = useState('#7B61FF');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [showSecurity, setShowSecurity] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const v = JSON.parse(stored);
      setVendor(v);
      setName(v.name || '');
      setEmail(v.email || '');
      setNif(v.nif || '');
      setPhone(v.phone || '');
      setPinColor(v.pin_color || '#7B61FF');
    }
  }, []);

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

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!vendor) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const data = new FormData();
      if (name !== vendor.name) data.append('name', name);
      const emailChanged = email !== vendor.email;
      if (emailChanged) data.append('email', email);
      if (nif !== (vendor.nif || '')) data.append('nif', nif);
      if (phone !== (vendor.phone || '')) data.append('phone', phone);
      if (password) {
        data.append('new_password', password);
        data.append('old_password', oldPassword);
      }
      if (pinColor !== (vendor.pin_color || '#7B61FF')) data.append('pin_color', pinColor);
      if (photo) data.append('profile_photo', new File([photo], 'profile.jpg', { type: 'image/jpeg' }));

      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `${BASE_URL}/vendors/${vendor.id}/profile`,
        data,
        { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem('user', JSON.stringify(res.data));
      setVendor(res.data);
      if (res.data.pending_email) {
        setEmail(res.data.email || '');
        setSuccess(
          `Dados atualizados! Enviámos um email para ${res.data.pending_email} — confirma esse endereço para concluíres a alteração de email.`
        );
      } else {
        setSuccess('Dados atualizados com sucesso!');
      }
      setPassword('');
      setOldPassword('');
      setPhoto(null);
      if (photoPreview) { URL.revokeObjectURL(photoPreview); setPhotoPreview(null); }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao atualizar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = photoPreview
    || (vendor?.profile_photo ? mediaUrl(vendor.profile_photo) : null);

  if (!vendor) {
    return (
      <div className="vendor-page">
        <BackHomeButton />
        <p className="page-empty">Utilizador não autenticado.</p>
      </div>
    );
  }

  return (
    <div className="vendor-page">
      <BackHomeButton />

      <div className="vendor-hero">
        <FiUser className="vendor-hero-icon" />
        <h1 className="vendor-hero-title">Gerir Conta</h1>
        <p className="vendor-hero-lead">
          Atualize seus dados pessoais, foto de perfil e preferências de segurança.
        </p>
      </div>

      <form onSubmit={handleUpdate}>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.10)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start',
            color: '#c62828'
          }}>
            <FiAlertCircle style={{ marginTop: '2px', flexShrink: 0 }} />
            <span style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(76, 175, 80, 0.10)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start',
            color: '#2e7d32'
          }}>
            <FiCheck style={{ marginTop: '2px', flexShrink: 0 }} />
            <span style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>{success}</span>
          </div>
        )}

        {/* Aparência */}
        <div className="vendor-section">
          <h2 className="vendor-section-title"><FiDroplet size={18} /> Aparência</h2>
          <div className="vendor-card">
            <div className="vendor-card-title">Foto de Perfil</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'relative',
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  border: '3px solid var(--primary-light-solid)',
                  background: 'var(--surface-alt)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-dark)' }}>
                    {vendor.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity var(--transition)'
                }} onMouseEnter={(e) => e.target.style.opacity = '1'} onMouseLeave={(e) => e.target.style.opacity = '0'}>
                  <FiCamera size={24} color="white" />
                </div>
              </button>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text)' }}>Clique para alterar</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>JPG, PNG até 5MB</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />

            <div className="vendor-field">
              <label className="vendor-label">Cor do Pin no Mapa</label>
              <PinColorPicker value={pinColor} onChange={setPinColor} />
            </div>
          </div>
        </div>

        {/* Dados Pessoais */}
        <div className="vendor-section">
          <h2 className="vendor-section-title"><FiUser size={18} /> Dados Pessoais</h2>
          <div className="vendor-card">
            <div className="vendor-field">
              <label className="vendor-label">Nome Completo</label>
              <input
                className="vendor-input"
                type="text"
                placeholder="O teu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="vendor-field">
              <label className="vendor-label">Email</label>
              <input
                className="vendor-input"
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {vendor.pending_email ? (
                <small style={{ color: '#ff9800', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                  ℹ Alteração pendente: confirma <strong>{vendor.pending_email}</strong> no email que enviámos.
                </small>
              ) : (
                <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                  Ao alterar o email vais receber um link de confirmação no novo endereço.
                </small>
              )}
            </div>
            <div className="vendor-field">
              <label className="vendor-label">NIF</label>
              <input
                className="vendor-input"
                type="text"
                inputMode="numeric"
                maxLength={9}
                placeholder="123456789"
                value={nif}
                onChange={(e) => setNif(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div className="vendor-field">
              <label className="vendor-label">Telemóvel</label>
              <input
                className="vendor-input"
                type="tel"
                placeholder="912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Segurança */}
        <div className="vendor-section">
          <h2 className="vendor-section-title"><FiLock size={18} /> Segurança</h2>
          <div className="vendor-card">
            <button
              type="button"
              onClick={() => setShowSecurity(v => !v)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '700',
                color: 'var(--text)',
                marginBottom: showSecurity ? '16px' : '0'
              }}
            >
              <span>Alterar Palavra-passe</span>
              {showSecurity ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </button>
            {showSecurity && (
              <>
                <div className="vendor-field">
                  <label className="vendor-label">Palavra-passe Atual</label>
                  <input
                    className="vendor-input"
                    type="password"
                    placeholder="Palavra-passe atual"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <div className="vendor-field">
                  <label className="vendor-label">Nova Palavra-passe</label>
                  <input
                    className="vendor-input"
                    type="password"
                    placeholder="Mínimo 8 caracteres, maiúscula e número"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <button type="submit" className="vendor-btn" disabled={saving} style={{ marginTop: '24px' }}>
          <FiSave />
          {saving ? 'A guardar…' : 'Guardar Alterações'}
        </button>
      </form>

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
