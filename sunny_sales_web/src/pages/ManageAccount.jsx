import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { BASE_URL, mediaUrl } from '../config';
import ImageCropper from '../components/ImageCropper';
import BackHomeButton from '../components/BackHomeButton';
import {
  FiUser, FiLock, FiPackage, FiCamera, FiCheck,
  FiDollarSign, FiSmartphone, FiTerminal, FiCreditCard, FiWifi,
  FiChevronDown, FiChevronUp, FiSave, FiBriefcase,
} from 'react-icons/fi';
import './ManageAccount.css';

const PAYMENT_METHODS = [
  { id: 'Numerário', label: 'Numerário', icon: <FiDollarSign /> },
  { id: 'MB Way', label: 'MB Way', icon: <FiSmartphone /> },
  { id: 'Multibanco', label: 'Multibanco', icon: <FiTerminal /> },
  { id: 'Cartão', label: 'Cartão', icon: <FiCreditCard /> },
  { id: 'NFC', label: 'NFC', icon: <FiWifi /> },
];

export default function ManageAccount() {
  const [vendor, setVendor] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nif, setNif] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [product, setProduct] = useState('');
  const [pinColor, setPinColor] = useState('#7B61FF');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
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
      setBusinessName(v.business_name || '');
      setProduct(v.product || '');
      setPinColor(v.pin_color || '#7B61FF');
      if (v.payment_methods) {
        setPaymentMethods(v.payment_methods.split(',').filter(Boolean));
      }
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

  const togglePayment = (id) => {
    setPaymentMethods(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
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
      if (businessName !== (vendor.business_name || '')) data.append('business_name', businessName);
      if (password) {
        data.append('new_password', password);
        data.append('old_password', oldPassword);
      }
      if (product !== vendor.product) data.append('product', product);
      if (pinColor !== (vendor.pin_color || '#7B61FF')) data.append('pin_color', pinColor);
      if (photo) data.append('profile_photo', new File([photo], 'profile.jpg', { type: 'image/jpeg' }));

      const newMethods = paymentMethods.join(',');
      if (newMethods !== (vendor.payment_methods || '')) data.append('payment_methods', newMethods);

      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `${BASE_URL}/vendors/${vendor.id}/profile`,
        data,
        { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem('user', JSON.stringify(res.data));
      setVendor(res.data);
      // O email só é alterado depois de confirmado pelo link enviado por email
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
      <div className="ma-wrapper">
        <BackHomeButton />
        <p className="page-empty">Utilizador não autenticado.</p>
      </div>
    );
  }

  return (
    <div className="ma-wrapper">
      <BackHomeButton />
      <div className="ma-container">
        <h1 className="ma-title">Definições de Conta</h1>

        <form onSubmit={handleUpdate} className="ma-form">

          {/* Avatar */}
          <div className="ma-photo-section">
            <button
              type="button"
              className="ma-avatar-btn"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Alterar foto de perfil"
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt="Foto de perfil" className="ma-avatar" />
              ) : (
                <div className="ma-avatar ma-avatar-placeholder">
                  {vendor.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div className="ma-avatar-overlay">
                <FiCamera className="ma-avatar-cam" />
              </div>
            </button>
            <span className="ma-photo-hint">Toca para alterar a foto</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </div>

          {error && <div className="ma-alert ma-alert-error">{error}</div>}
          {success && (
            <div className="ma-alert ma-alert-success">
              <FiCheck /> {success}
            </div>
          )}

          {/* Dados Pessoais */}
          <div className="ma-card">
            <div className="ma-card-header">
              <FiUser className="ma-card-icon" />
              <span className="ma-card-title">Dados Pessoais</span>
            </div>
            <div className="ma-field">
              <label className="ma-label">Nome completo</label>
              <input
                className="ma-input"
                type="text"
                placeholder="O teu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="ma-field">
              <label className="ma-label">Email</label>
              <input
                className="ma-input"
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {vendor.pending_email ? (
                <span className="ma-field-hint">
                  Alteração pendente: confirma <strong>{vendor.pending_email}</strong> no email que enviámos.
                </span>
              ) : (
                <span className="ma-field-hint">
                  Ao alterar o email vais receber um link de confirmação no novo endereço.
                </span>
              )}
            </div>
            <div className="ma-field">
              <label className="ma-label">NIF</label>
              <input
                className="ma-input"
                type="text"
                inputMode="numeric"
                maxLength={9}
                placeholder="123456789"
                value={nif}
                onChange={(e) => setNif(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div className="ma-field">
              <label className="ma-label">Telemóvel</label>
              <input
                className="ma-input"
                type="tel"
                placeholder="912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Atividade / Firma */}
          <div className="ma-card">
            <div className="ma-card-header">
              <FiBriefcase className="ma-card-icon" />
              <span className="ma-card-title">Atividade</span>
            </div>
            <div className="ma-field">
              <label className="ma-label">Nome da Atividade / Firma</label>
              <input
                className="ma-input"
                type="text"
                placeholder="Nome comercial (opcional)"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
          </div>

          {/* Segurança */}
          <div className="ma-card">
            <button
              type="button"
              className="ma-card-header ma-card-toggle"
              onClick={() => setShowSecurity(v => !v)}
              aria-expanded={showSecurity}
            >
              <span className="ma-card-header-left">
                <FiLock className="ma-card-icon" />
                <span className="ma-card-title">Segurança</span>
              </span>
              {showSecurity ? <FiChevronUp className="ma-toggle-icon" /> : <FiChevronDown className="ma-toggle-icon" />}
            </button>
            {showSecurity && (
              <div className="ma-card-body">
                <div className="ma-field">
                  <label className="ma-label">Palavra-passe atual</label>
                  <input
                    className="ma-input"
                    type="password"
                    placeholder="Palavra-passe atual"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <div className="ma-field">
                  <label className="ma-label">Nova palavra-passe</label>
                  <input
                    className="ma-input"
                    type="password"
                    placeholder="Mínimo 8 caracteres, maiúscula e número"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Produto & Aparência */}
          <div className="ma-card">
            <div className="ma-card-header">
              <FiPackage className="ma-card-icon" />
              <span className="ma-card-title">Produto & Aparência</span>
            </div>
            <div className="ma-field">
              <label className="ma-label">Tipo de produto</label>
              <div className="ma-product-grid">
                {['Bolas de Berlim', 'Gelados', 'Acessórios de Praia'].map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`ma-product-chip${product === p ? ' selected' : ''}`}
                    onClick={() => setProduct(p)}
                  >
                    {product === p && <FiCheck className="ma-chip-check" />}
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="ma-field">
              <label className="ma-label">Cor do pin no mapa</label>
              <div className="ma-color-row">
                <input
                  type="color"
                  value={pinColor}
                  onChange={(e) => setPinColor(e.target.value)}
                  className="ma-color-input"
                />
              </div>
            </div>
          </div>

          {/* Métodos de Pagamento */}
          <div className="ma-card">
            <div className="ma-card-header">
              <FiCreditCard className="ma-card-icon" />
              <span className="ma-card-title">Métodos de Pagamento</span>
            </div>
            <p className="ma-card-desc">Indica quais os métodos que aceitas dos clientes.</p>
            <div className="ma-payment-grid">
              {PAYMENT_METHODS.map(({ id, label, icon }) => {
                const active = paymentMethods.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    className={`ma-payment-chip${active ? ' active' : ''}`}
                    onClick={() => togglePayment(id)}
                    aria-pressed={active}
                  >
                    <span className="ma-payment-icon">{icon}</span>
                    <span className="ma-payment-label">{label}</span>
                    {active && <FiCheck className="ma-payment-check" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" className="ma-save-btn" disabled={saving}>
            <FiSave />
            {saving ? 'A guardar…' : 'Guardar Alterações'}
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
