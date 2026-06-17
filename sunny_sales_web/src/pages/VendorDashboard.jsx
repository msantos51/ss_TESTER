import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL, mediaUrl } from '../config';
import axios from 'axios';
import {
  FiCalendar, FiFileText,
  FiCreditCard, FiMail, FiMapPin, FiLogOut,
  FiDollarSign, FiSmartphone, FiTerminal, FiWifi,
  FiNavigation, FiUser, FiLock, FiCheck,
  FiChevronRight, FiSend, FiCheckSquare,
} from 'react-icons/fi';
import ImageCropper from '../components/ImageCropper';
import './VendorDashboard.css';

const PAYMENT_ICONS = {
  'Numerário': <FiDollarSign />,
  'MB Way': <FiSmartphone />,
  'Multibanco': <FiTerminal />,
  'Cartão': <FiCreditCard />,
  'NFC': <FiWifi />,
};

let watchId = null;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 19) return 'Boa tarde';
  return 'Boa noite';
}

export default function VendorDashboard() {
  const [vendor, setVendor] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [pinColor, setPinColor] = useState('#FFB6C1');
  const navigate = useNavigate();

  // Profile modal state
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState('perfil');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editProduct, setEditProduct] = useState('');
  const [editPhoto, setEditPhoto] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState(null);
  const [editCropSrc, setEditCropSrc] = useState(null);
  const [editPinColor, setEditPinColor] = useState('#FFB6C1');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  // Security tab state
  const [secOldPassword, setSecOldPassword] = useState('');
  const [secNewPassword, setSecNewPassword] = useState('');
  const [secSaving, setSecSaving] = useState(false);
  const [secError, setSecError] = useState('');
  const [secSuccess, setSecSuccess] = useState('');

  const logout = () => {
    stopSharing();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/vendor-login');
  };

  const startSharing = useCallback(async () => {
    if (!vendor) return;
    const expires = vendor.subscription_valid_until
      ? new Date(vendor.subscription_valid_until)
      : null;
    if (!vendor.subscription_active || (expires && expires < new Date())) {
      alert('Não consegue partilhar a localização porque não tem a subscrição ativa');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.post(`${BASE_URL}/vendors/${vendor.id}/routes/start`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          try {
            await axios.put(
              `${BASE_URL}/vendors/${vendor.id}/location`,
              { lat: pos.coords.latitude, lng: pos.coords.longitude },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (err) {
            console.error('Erro ao enviar localização:', err);
          }
        },
        (err) => console.error('Erro localização:', err),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
      localStorage.setItem('sharingLocation', 'true');
      setSharing(true);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        alert('Não consegue partilhar a localização porque não tem a subscrição ativa');
      } else {
        console.error('Erro ao ativar localização:', err);
      }
    }
  }, [vendor]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const v = JSON.parse(stored);
      setVendor(v);
      setPinColor(v.pin_color || '#FFB6C1');
    }
    const share = localStorage.getItem('sharingLocation') === 'true';
    setSharing(share);
  }, []);

  useEffect(() => {
    if (sharing && vendor && watchId === null) startSharing();
  }, [sharing, vendor, startSharing]);

  const stopSharing = async () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    if (vendor) {
      const token = localStorage.getItem('token');
      try {
        await axios.post(`${BASE_URL}/vendors/${vendor.id}/routes/stop`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error('Erro ao parar localização:', err);
      }
    }
    localStorage.setItem('sharingLocation', 'false');
    setSharing(false);
  };

  const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_28E3cvaRX1xWdIzd2ZeUU00';

  const paySubscription = () => {
    if (!vendor) return;
    window.open(`${STRIPE_PAYMENT_LINK}?client_reference_id=${vendor.id}`, '_blank');
  };

  // ── Profile modal ─────────────────────────────────────

  const openProfileModal = () => {
    if (!vendor) return;
    setProfileTab('perfil');
    setEditName(vendor.name || '');
    setEditEmail(vendor.email || '');
    setEditProduct(vendor.product || '');
    setEditPhoto(null);
    setEditPhotoPreview(null);
    setEditCropSrc(null);
    setEditPinColor(vendor.pin_color || '#FFB6C1');
    setEditError('');
    setSecOldPassword('');
    setSecNewPassword('');
    setSecError('');
    setSecSuccess('');
    setProfileOpen(true);
  };

  const closeProfileModal = () => {
    if (editPhotoPreview) URL.revokeObjectURL(editPhotoPreview);
    if (editCropSrc) URL.revokeObjectURL(editCropSrc);
    setProfileOpen(false);
    setEditPhoto(null);
    setEditPhotoPreview(null);
    setEditCropSrc(null);
  };

  const handleEditPhoto = (e) => {
    if (e.target.files?.[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setEditCropSrc(url);
    }
  };

  const handleEditCropCancel = () => {
    if (editCropSrc) URL.revokeObjectURL(editCropSrc);
    setEditCropSrc(null);
  };

  const handleEditCropComplete = (blob) => {
    if (editCropSrc) URL.revokeObjectURL(editCropSrc);
    setEditCropSrc(null);
    setEditPhoto(blob);
    if (editPhotoPreview) URL.revokeObjectURL(editPhotoPreview);
    setEditPhotoPreview(URL.createObjectURL(blob));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!vendor) return;
    setEditSaving(true);
    setEditError('');
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      if (editName !== vendor.name) data.append('name', editName);
      if (editEmail !== vendor.email) data.append('email', editEmail);
      if (editProduct !== vendor.product) data.append('product', editProduct);
      if (editPinColor !== (vendor.pin_color || '#FFB6C1')) data.append('pin_color', editPinColor);
      if (editPhoto) {
        const file = new File([editPhoto], 'profile.jpg', { type: 'image/jpeg' });
        data.append('profile_photo', file);
      }
      const res = await axios.patch(
        `${BASE_URL}/vendors/${vendor.id}/profile`,
        data,
        { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } }
      );
      const updated = res.data;
      localStorage.setItem('user', JSON.stringify(updated));
      setVendor(updated);
      setPinColor(updated.pin_color || '#FFB6C1');
      closeProfileModal();
    } catch {
      setEditError('Erro ao guardar alterações');
    } finally {
      setEditSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (!vendor) return;
    if (!secOldPassword || !secNewPassword) {
      setSecError('Preencha ambos os campos.');
      return;
    }
    if (secNewPassword.length < 8) {
      setSecError('A nova palavra-passe deve ter pelo menos 8 caracteres.');
      return;
    }
    setSecSaving(true);
    setSecError('');
    setSecSuccess('');
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('old_password', secOldPassword);
      data.append('new_password', secNewPassword);
      await axios.patch(
        `${BASE_URL}/vendors/${vendor.id}/profile`,
        data,
        { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } }
      );
      setSecSuccess('Palavra-passe alterada com sucesso!');
      setSecOldPassword('');
      setSecNewPassword('');
    } catch (err) {
      setSecError(err.response?.data?.detail || 'Erro ao alterar a palavra-passe.');
    } finally {
      setSecSaving(false);
    }
  };

  const subscriptionActive = vendor?.subscription_active;
  const subscriptionDate = vendor?.subscription_valid_until
    ? new Date(vendor.subscription_valid_until).toLocaleDateString('pt-PT')
    : null;

  const modalAvatarSrc = editPhotoPreview
    || (vendor?.profile_photo ? mediaUrl(vendor.profile_photo) : null);

  return (
    <div className="vd-wrapper">
      <div className="vd-container">

        {/* Greeting */}
        {vendor && (
          <div className="vd-greeting">
            <span className="vd-greeting-time">{getGreeting()},</span>
            <h2 className="vd-greeting-name">{vendor.name.split(' ')[0]}</h2>
          </div>
        )}

        {/* Profile card */}
        {vendor && (
          <div className="vd-profile-card">
            <div className="vd-profile-top">
              {vendor.profile_photo ? (
                <img
                  src={mediaUrl(vendor.profile_photo)}
                  alt="Foto de perfil"
                  className="vd-avatar"
                  style={{ borderColor: pinColor }}
                />
              ) : (
                <div
                  className="vd-avatar vd-avatar-placeholder"
                  style={{ borderColor: pinColor, background: `${pinColor}22`, color: pinColor }}
                >
                  {vendor.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div className="vd-profile-meta">
                <span className="vd-profile-name">{vendor.name}</span>
                <span className="vd-profile-product">{vendor.product}</span>
                <span className={`vd-sub-badge${subscriptionActive ? ' active' : ' inactive'}`}>
                  <span className="vd-sub-dot" />
                  {subscriptionActive
                    ? <>Ativa{subscriptionDate && <span className="vd-sub-date"> · {subscriptionDate}</span>}</>
                    : 'Inativa'}
                </span>
              </div>
            </div>

            <div className="vd-profile-divider" />

            <div className="vd-profile-details">
              <div className="vd-detail-row">
                <span className="vd-detail-row-icon"><FiMail /></span>
                <span className="vd-detail-row-label">EMAIL</span>
                <span className="vd-detail-row-value">{vendor.email}</span>
                <FiChevronRight className="vd-detail-row-chevron" />
              </div>
              <div className="vd-detail-row">
                <span className="vd-detail-row-icon">
                  <span className="vd-pin-dot" style={{ backgroundColor: pinColor }} />
                </span>
                <span className="vd-detail-row-label">COR DO PIN</span>
                <span className="vd-detail-row-value" />
                <FiChevronRight className="vd-detail-row-chevron" />
              </div>
              {vendor.payment_methods && (
                <div className="vd-detail-row vd-detail-row-payments">
                  <span className="vd-detail-row-icon"><FiCreditCard /></span>
                  <span className="vd-detail-row-label">PAGAMENTOS</span>
                  <div className="vd-payments-row">
                    {vendor.payment_methods.split(',').filter(Boolean).map(m => (
                      <span key={m} className="vd-payment-badge" title={m}>
                        <span className="vd-payment-badge-icon">{PAYMENT_ICONS[m] || <FiCreditCard />}</span>
                        <span className="vd-payment-badge-label">{m}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subscription CTA if inactive */}
        {vendor && !subscriptionActive && (
          <div className="vd-cta-card">
            <div className="vd-cta-text">
              <span className="vd-cta-title">Subscrição Inativa</span>
              <span className="vd-cta-desc">Ative para aparecer no mapa</span>
            </div>
            <button className="vd-cta-btn" onClick={paySubscription}>
              Ativar
            </button>
          </div>
        )}

        {/* Location sharing */}
        <div className={`vd-location-card${sharing ? ' active' : ''}`}>
          <div className="vd-location-icon-wrap">
            <FiMapPin className="vd-location-icon" />
            {sharing && <span className="vd-location-pulse" />}
          </div>
          <div className="vd-location-text">
            <span className="vd-location-title">Partilha de Localização</span>
            <span className="vd-location-status">
              {sharing ? 'Ativo e visível no mapa' : 'Desligado'}
            </span>
          </div>
          <label className="vendor-switch" aria-label="Ativar/desativar localização">
            <input
              type="checkbox"
              checked={sharing}
              onChange={sharing ? stopSharing : startSharing}
            />
            <span className="slider" />
          </label>
        </div>

        {/* Quick actions grid */}
        <div className="vd-quick-grid">
          <button className="vd-quick-card" onClick={openProfileModal}>
            <span className="vd-quick-icon"><FiUser /></span>
            <span className="vd-quick-label">Perfil</span>
            <span className="vd-quick-desc">Ver e editar informações pessoais</span>
          </button>
          <button className="vd-quick-card" onClick={() => navigate('/routes')}>
            <span className="vd-quick-icon"><FiSend /></span>
            <span className="vd-quick-label">Trajetos</span>
            <span className="vd-quick-desc">Consultar histórico de rotas</span>
          </button>
          <button className="vd-quick-card" onClick={paySubscription}>
            <span className="vd-quick-icon"><FiCheckSquare /></span>
            <span className="vd-quick-label">Ativar Subscrição</span>
            <span className="vd-quick-desc">Ativar ou renovar o plano</span>
          </button>
          <button className="vd-quick-card" onClick={() => navigate('/paid-weeks')}>
            <span className="vd-quick-icon"><FiCalendar /></span>
            <span className="vd-quick-label">Subscrições</span>
            <span className="vd-quick-desc">Gerir planos e semanas pagas</span>
          </button>
          <button className="vd-quick-card" onClick={() => navigate('/invoices')}>
            <span className="vd-quick-icon"><FiFileText /></span>
            <span className="vd-quick-label">Faturas</span>
            <span className="vd-quick-desc">Consultar faturas e recibos</span>
          </button>
          <button className="vd-quick-card" onClick={() => navigate('/contacto')}>
            <span className="vd-quick-icon"><FiMail /></span>
            <span className="vd-quick-label">Contactar Suporte</span>
            <span className="vd-quick-desc">Enviar mensagem à equipa</span>
          </button>
        </div>

        <button className="vd-logout-btn" onClick={logout}>
          <FiLogOut size={15} />
          Terminar Sessão
        </button>

      </div>

      {/* Profile edit modal */}
      {profileOpen && (
        <div className="vd-modal-overlay" onClick={closeProfileModal}>
          <div className="vd-modal" onClick={e => e.stopPropagation()}>
            <div className="vd-modal-header">
              <button type="button" className="back-btn" onClick={closeProfileModal}>
                ← Voltar
              </button>
              <span className="vd-modal-title">Perfil</span>
            </div>

            {/* Tabs */}
            <div className="vd-modal-tabs">
              <button
                type="button"
                className={`vd-modal-tab${profileTab === 'perfil' ? ' active' : ''}`}
                onClick={() => setProfileTab('perfil')}
              >
                <FiUser size={14} /> Perfil
              </button>
              <button
                type="button"
                className={`vd-modal-tab${profileTab === 'seguranca' ? ' active' : ''}`}
                onClick={() => setProfileTab('seguranca')}
              >
                <FiLock size={14} /> Segurança
              </button>
            </div>

            {profileTab === 'perfil' && (
              <form className="vd-modal-form" onSubmit={saveProfile}>
                {/* Avatar + photo upload */}
                <div className="vd-modal-photo-section">
                  {modalAvatarSrc ? (
                    <img
                      src={modalAvatarSrc}
                      alt="Foto de perfil"
                      className="vd-modal-avatar"
                      style={{ borderColor: editPinColor }}
                    />
                  ) : (
                    <div
                      className="vd-modal-avatar vd-modal-avatar-placeholder"
                      style={{ borderColor: editPinColor, background: `${editPinColor}22`, color: editPinColor }}
                    >
                      {vendor?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <label className="vd-modal-photo-btn">
                    Alterar foto
                    <input type="file" accept="image/*" hidden onChange={handleEditPhoto} />
                  </label>
                </div>

                <div className="vd-modal-field">
                  <label className="vd-modal-label">Nome</label>
                  <input
                    className="vd-modal-input"
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    required
                  />
                </div>
                <div className="vd-modal-field">
                  <label className="vd-modal-label">Email</label>
                  <input
                    className="vd-modal-input"
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="vd-modal-field">
                  <label className="vd-modal-label">Produto</label>
                  <select
                    className="vd-modal-input"
                    value={editProduct}
                    onChange={e => setEditProduct(e.target.value)}
                  >
                    <option value="Bolas de Berlim">Bolas de Berlim</option>
                    <option value="Gelados">Gelados</option>
                    <option value="Acessórios de Praia">Acessórios de Praia</option>
                  </select>
                </div>
                <div className="vd-modal-field">
                  <label className="vd-modal-label">Cor do Pin</label>
                  <div className="vd-modal-pin-row">
                    <label className="vd-modal-pin-swatch" style={{ backgroundColor: editPinColor }}>
                      <input
                        type="color"
                        value={editPinColor}
                        onChange={e => setEditPinColor(e.target.value)}
                        className="vd-modal-pin-input"
                      />
                    </label>
                  </div>
                </div>

                {editError && <p className="vd-modal-error">{editError}</p>}

                <div className="vd-modal-actions">
                  <button type="button" className="vd-modal-cancel" onClick={closeProfileModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="vd-modal-save" disabled={editSaving}>
                    {editSaving ? 'A guardar…' : 'Guardar'}
                  </button>
                </div>
              </form>
            )}

            {profileTab === 'seguranca' && (
              <form className="vd-modal-form" onSubmit={savePassword}>
                <div className="vd-modal-security-header">
                  <FiLock size={24} className="vd-modal-security-icon" />
                  <p className="vd-modal-security-desc">
                    Introduz a tua palavra-passe atual e escolhe uma nova.
                  </p>
                </div>

                <div className="vd-modal-field">
                  <label className="vd-modal-label">Palavra-passe atual</label>
                  <input
                    className="vd-modal-input"
                    type="password"
                    placeholder="Palavra-passe atual"
                    value={secOldPassword}
                    onChange={e => setSecOldPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                <div className="vd-modal-field">
                  <label className="vd-modal-label">Nova palavra-passe</label>
                  <input
                    className="vd-modal-input"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={secNewPassword}
                    onChange={e => setSecNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>

                {secError && <p className="vd-modal-error">{secError}</p>}
                {secSuccess && (
                  <p className="vd-modal-success">
                    <FiCheck size={14} /> {secSuccess}
                  </p>
                )}

                <div className="vd-modal-actions">
                  <button type="button" className="vd-modal-cancel" onClick={closeProfileModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="vd-modal-save" disabled={secSaving}>
                    {secSaving ? 'A guardar…' : 'Alterar Palavra-passe'}
                  </button>
                </div>
              </form>
            )}

            {editCropSrc && (
              <ImageCropper
                src={editCropSrc}
                onCancel={handleEditCropCancel}
                onComplete={handleEditCropComplete}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
