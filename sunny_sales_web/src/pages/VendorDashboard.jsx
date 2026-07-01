import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BASE_URL, mediaUrl } from '../config';
import axios from 'axios';
import {
  FiFileText,
  FiCreditCard, FiMail, FiMapPin,
  FiDollarSign, FiSmartphone, FiTerminal, FiWifi,
  FiUser, FiLock, FiCheck,
  FiShoppingBag, FiNavigation, FiBarChart2,
  FiEdit2, FiAlertCircle, FiX,
  FiClock, FiTrendingUp,
} from 'react-icons/fi';
import ImageCropper from '../components/ImageCropper';
import PinColorPicker from '../components/PinColorPicker';
import VendorSidebar from '../components/VendorSidebar';
import './VendorDashboard.css';

// Distância mínima (m) entre leituras de GPS para serem aceites como
// movimento real; abaixo disto é ruído típico de GPS e a leitura é ignorada.
const MIN_GPS_DISTANCE_M = 8;

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const PAYMENT_ICONS = {
  'Numerário': <FiDollarSign />,
  'MB Way': <FiSmartphone />,
  'Multibanco': <FiTerminal />,
  'Cartão': <FiCreditCard />,
  'NFC': <FiWifi />,
};

let watchId = null;
let lastSentLocation = null;

async function checkLocationPermission() {
  if (!navigator.permissions?.query) return null;
  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state;
  } catch {
    return null;
  }
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 19) return 'Boa tarde';
  return 'Boa noite';
}

function formatDistance(meters) {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

function formatDuration(ms) {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function relativeTime(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'agora mesmo';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return h === 1 ? 'há 1 hora' : `há ${h} horas`;
  const d = Math.floor(h / 24);
  if (d < 7) return d === 1 ? 'há 1 dia' : `há ${d} dias`;
  return new Date(dateStr).toLocaleDateString('pt-PT');
}

export default function VendorDashboard() {
  const [vendor, setVendor] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [pinColor, setPinColor] = useState('#7B61FF');
  const [locationPermission, setLocationPermission] = useState(null);
  const [routes, setRoutes] = useState(null); // null = a carregar
  const [notice, setNotice] = useState(null);
  const navigate = useNavigate();

  // Profile modal state
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState('aparencia');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editNif, setEditNif] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editProduct, setEditProduct] = useState('');
  const [editPhoto, setEditPhoto] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState(null);
  const [editCropSrc, setEditCropSrc] = useState(null);
  const [editPinColor, setEditPinColor] = useState('#7B61FF');
  const [editPaymentMethods, setEditPaymentMethods] = useState([]);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [personalSaving, setPersonalSaving] = useState(false);
  const [personalError, setPersonalError] = useState('');
  const [personalSuccess, setPersonalSuccess] = useState('');
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

  const requestLocationPermission = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationPermission('granted');
        localStorage.setItem('locationPermissionAsked', 'true');
      },
      () => {
        setLocationPermission('denied');
        localStorage.setItem('locationPermissionAsked', 'true');
      }
    );
  };

  const startSharing = useCallback(async () => {
    if (!vendor) return;
    const expires = vendor.subscription_valid_until
      ? new Date(vendor.subscription_valid_until)
      : null;
    if (!vendor.subscription_active || (expires && expires < new Date())) {
      setNotice({
        type: 'warning',
        text: 'Precisas de uma subscrição ativa para partilhar a tua localização.',
      });
      return;
    }

    if (locationPermission === 'denied') {
      setNotice({
        type: 'warning',
        text: 'Permissão de localização negada. Ativa-a nas definições do browser.',
      });
      return;
    }

    if (locationPermission === 'prompt') {
      requestLocationPermission();
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.post(`${BASE_URL}/vendors/${vendor.id}/routes/start`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      lastSentLocation = null;
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng, accuracy } = pos.coords;
          if (accuracy != null && accuracy > 20) return;
          if (
            lastSentLocation &&
            haversineDistance(lastSentLocation.lat, lastSentLocation.lng, lat, lng) < MIN_GPS_DISTANCE_M
          ) {
            return;
          }
          try {
            await axios.put(
              `${BASE_URL}/vendors/${vendor.id}/location`,
              { lat, lng },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            lastSentLocation = { lat, lng };
          } catch (err) {
            console.error('Erro ao enviar localização:', err);
          }
        },
        (err) => console.error('Erro localização:', err),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
      localStorage.setItem('sharingLocation', 'true');
      setSharing(true);
      setNotice(null);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setNotice({
          type: 'warning',
          text: 'Precisas de uma subscrição ativa para partilhar a tua localização.',
        });
      } else {
        console.error('Erro ao ativar localização:', err);
        setNotice({
          type: 'error',
          text: 'Não foi possível ativar a partilha de localização. Tenta novamente.',
        });
      }
    }
  }, [vendor, locationPermission]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const v = JSON.parse(stored);
      setVendor(v);
      setPinColor(v.pin_color || '#7B61FF');
    }
    const share = localStorage.getItem('sharingLocation') === 'true';
    setSharing(share);

    const checkPermission = async () => {
      const permStatus = await checkLocationPermission();
      setLocationPermission(permStatus);
      if (permStatus === 'prompt') {
        requestLocationPermission();
      }
    };
    checkPermission();
  }, []);

  // Carrega os trajetos para calcular o resumo do dia e a atividade recente
  useEffect(() => {
    if (!vendor?.id) return;
    const token = localStorage.getItem('token');
    axios
      .get(`${BASE_URL}/vendors/${vendor.id}/routes`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => setRoutes(res.data))
      .catch((err) => {
        console.error('Erro ao carregar trajetos:', err);
        setRoutes([]);
      });
  }, [vendor?.id]);

  useEffect(() => {
    if (sharing && vendor && watchId === null) startSharing();
  }, [sharing, vendor, startSharing]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && sharing && watchId === null && vendor) {
        startSharing();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
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

  // ── Resumo de hoje e atividade recente ────────────────

  const stats = useMemo(() => {
    if (!routes) return null;
    const now = new Date();
    const todayKey = now.toDateString();
    const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    let distToday = 0;
    let msToday = 0;
    let sessionsToday = 0;
    let distWeek = 0;
    routes.forEach((r) => {
      const start = new Date(r.start_time);
      const end = r.end_time ? new Date(r.end_time) : now;
      if (start.toDateString() === todayKey) {
        distToday += r.distance_m || 0;
        msToday += Math.max(0, end - start);
        sessionsToday += 1;
      }
      if (start.getTime() >= weekAgo) {
        distWeek += r.distance_m || 0;
      }
    });
    return { distToday, msToday, sessionsToday, distWeek };
  }, [routes]);

  const recentRoutes = useMemo(() => {
    if (!routes) return [];
    return [...routes]
      .sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
      .slice(0, 4);
  }, [routes]);

  // ── Profile modal ─────────────────────────────────────

  const openProfileModal = () => {
    if (!vendor) return;
    setProfileTab('aparencia');
    setEditName(vendor.name || '');
    setEditEmail(vendor.email || '');
    setEditNif(vendor.nif || '');
    setEditPhone(vendor.phone || '');
    setEditProduct(vendor.product || '');
    setEditPhoto(null);
    setEditPhotoPreview(null);
    setEditCropSrc(null);
    setEditPinColor(vendor.pin_color || '#7B61FF');
    setEditPaymentMethods(vendor.payment_methods ? vendor.payment_methods.split(',').filter(Boolean) : []);
    setEditError('');
    setEditSuccess('');
    setPersonalError('');
    setPersonalSuccess('');
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

  const togglePaymentMethod = (method) => {
    setEditPaymentMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const handleEditCropComplete = (blob) => {
    if (editCropSrc) URL.revokeObjectURL(editCropSrc);
    setEditCropSrc(null);
    setEditPhoto(blob);
    if (editPhotoPreview) URL.revokeObjectURL(editPhotoPreview);
    setEditPhotoPreview(URL.createObjectURL(blob));
  };

  const saveAppearance = async (e) => {
    e.preventDefault();
    if (!vendor) return;
    setEditSaving(true);
    setEditError('');
    setEditSuccess('');
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      if (editPinColor !== (vendor.pin_color || '#7B61FF')) data.append('pin_color', editPinColor);
      if (editPhoto) {
        const file = new File([editPhoto], 'profile.jpg', { type: 'image/jpeg' });
        data.append('profile_photo', file);
      }
      if (editProduct !== vendor.product) data.append('product', editProduct);
      const newPaymentMethods = editPaymentMethods.join(',');
      if (newPaymentMethods !== (vendor.payment_methods || '')) data.append('payment_methods', newPaymentMethods);
      const res = await axios.patch(
        `${BASE_URL}/vendors/${vendor.id}/profile`,
        data,
        { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } }
      );
      const updated = res.data;
      localStorage.setItem('user', JSON.stringify(updated));
      setVendor(updated);
      setPinColor(updated.pin_color || '#7B61FF');
      setEditSuccess('Aparência atualizada com sucesso!');
      setTimeout(() => {
        setEditPhoto(null);
        if (editPhotoPreview) URL.revokeObjectURL(editPhotoPreview);
        setEditPhotoPreview(null);
      }, 1000);
    } catch (err) {
      setEditError(err.response?.data?.detail || 'Erro ao guardar alterações');
    } finally {
      setEditSaving(false);
    }
  };

  const savePersonalData = async (e) => {
    e.preventDefault();
    if (!vendor) return;
    setPersonalSaving(true);
    setPersonalError('');
    setPersonalSuccess('');
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      if (editName !== vendor.name) data.append('name', editName);
      if (editEmail !== vendor.email) data.append('email', editEmail);
      if (editNif !== (vendor.nif || '')) data.append('nif', editNif);
      if (editPhone !== (vendor.phone || '')) data.append('phone', editPhone);
      const res = await axios.patch(
        `${BASE_URL}/vendors/${vendor.id}/profile`,
        data,
        { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } }
      );
      const updated = res.data;
      localStorage.setItem('user', JSON.stringify(updated));
      setVendor(updated);
      // O email só é alterado depois de confirmado pelo link enviado por email
      if (updated.pending_email) {
        setEditEmail(updated.email || '');
        setPersonalSuccess(
          `Dados guardados! Enviámos um email para ${updated.pending_email} — confirma esse endereço para concluíres a alteração de email.`
        );
      } else {
        setPersonalSuccess('Dados pessoais guardados com sucesso!');
      }
    } catch (err) {
      setPersonalError(err.response?.data?.detail || 'Erro ao guardar dados pessoais');
    } finally {
      setPersonalSaving(false);
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

  const todayLabel = new Date().toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const quickActions = [
    { path: '/routes', icon: <FiNavigation />, label: 'Trajetos', desc: 'Histórico de sessões' },
    { path: '/stats', icon: <FiBarChart2 />, label: 'Estatísticas', desc: 'Km percorridos por dia' },
    { path: '/products', icon: <FiShoppingBag />, label: 'Produtos', desc: 'Gerir o teu catálogo' },
    { path: '/paid-weeks', icon: <FiCreditCard />, label: 'Subscrição', desc: 'Pagamentos e recibos' },
  ];

  return (
    <div className="vd-wrapper">
      <VendorSidebar onLogout={logout} />
      <div className="vd-container">

        {/* Cabeçalho */}
        {vendor && (
          <div className="vd-hero">
            <span className="vd-hero-date">{todayLabel}</span>
            <h1 className="vd-hero-title">
              {getGreeting()}, {vendor.name.split(' ')[0]}
            </h1>
            <p className="vd-hero-subtitle">
              Gere a tua presença no mapa e acompanha a tua atividade do dia.
            </p>
            <div className="vd-hero-chips">
              <span className={`vd-hero-chip${subscriptionActive ? ' on' : ' off'}`}>
                <span className="vd-hero-chip-dot" />
                {subscriptionActive ? 'Subscrição ativa' : 'Subscrição inativa'}
              </span>
              <span className={`vd-hero-chip${sharing ? ' on' : ' off'}`}>
                <span className="vd-hero-chip-dot" />
                {sharing ? 'Visível no mapa' : 'Localização desligada'}
              </span>
            </div>
          </div>
        )}

        {/* Aviso contextual (substitui os alert()) */}
        {notice && (
          <div className={`vd-notice vd-notice-${notice.type}`} role="alert">
            <FiAlertCircle className="vd-notice-icon" />
            <span className="vd-notice-text">{notice.text}</span>
            <button
              type="button"
              className="vd-notice-close"
              aria-label="Fechar aviso"
              onClick={() => setNotice(null)}
            >
              <FiX />
            </button>
          </div>
        )}

        {/* Permissão de localização negada */}
        {locationPermission === 'denied' && (
          <div className="vd-cta-card warning">
            <div className="vd-cta-text">
              <span className="vd-cta-title">Permissão de localização negada</span>
              <span className="vd-cta-desc">Ativa-a nas definições do browser para poderes partilhar a tua localização</span>
            </div>
          </div>
        )}

        {/* CTA de subscrição inativa */}
        {vendor && !subscriptionActive && (
          <div className="vd-cta-card">
            <div className="vd-cta-text">
              <span className="vd-cta-title">Subscrição inativa</span>
              <span className="vd-cta-desc">Ativa a subscrição para apareceres no mapa e receberes clientes</span>
            </div>
            <button className="vd-cta-btn" onClick={() => navigate('/planos')}>
              Ativar
            </button>
          </div>
        )}

        {/* Partilha de localização */}
        <div className={`vd-location-card${sharing ? ' active' : ''}`}>
          <div className="vd-location-icon-wrap">
            <FiMapPin className="vd-location-icon" />
            {sharing && <span className="vd-location-pulse" />}
          </div>
          <div className="vd-location-text">
            <span className="vd-location-title">Partilha de localização</span>
            <span className="vd-location-status">
              {sharing
                ? 'Ativa — estás visível no mapa'
                : subscriptionActive
                  ? 'Desligada — não apareces no mapa'
                  : 'Requer subscrição ativa'}
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

        <div className="vd-info-card">
          💡 <strong>Dica:</strong> a app web partilha a localização enquanto o separador estiver
          ativo. Para partilha contínua em segundo plano, usa a <strong>app móvel</strong>.
        </div>

        {/* Resumo de hoje (dados reais dos trajetos) */}
        {vendor && (
          <div className="vd-stats-section">
            <h3 className="vd-section-title">Resumo de hoje</h3>
            <div className="vd-stats-grid">
              <div className="vd-stat-card">
                <div className="vd-stat-icon"><FiNavigation /></div>
                <div className="vd-stat-value">
                  {stats ? formatDistance(stats.distToday) : '—'}
                </div>
                <div className="vd-stat-label">Distância percorrida</div>
              </div>
              <div className="vd-stat-card">
                <div className="vd-stat-icon"><FiClock /></div>
                <div className="vd-stat-value">
                  {stats ? formatDuration(stats.msToday) : '—'}
                </div>
                <div className="vd-stat-label">Tempo online</div>
              </div>
              <div className="vd-stat-card">
                <div className="vd-stat-icon"><FiMapPin /></div>
                <div className="vd-stat-value">
                  {stats ? stats.sessionsToday : '—'}
                </div>
                <div className="vd-stat-label">Sessões de partilha</div>
              </div>
              <div className="vd-stat-card">
                <div className="vd-stat-icon"><FiTrendingUp /></div>
                <div className="vd-stat-value">
                  {stats ? formatDistance(stats.distWeek) : '—'}
                </div>
                <div className="vd-stat-label">Últimos 7 dias</div>
              </div>
            </div>
          </div>
        )}

        {/* Ações rápidas */}
        <div className="vd-quick-section">
          <h3 className="vd-section-title">Ações rápidas</h3>
          <div className="vd-quick-grid">
            {quickActions.map((action) => (
              <button
                key={action.path}
                type="button"
                className="vd-quick-card"
                onClick={() => navigate(action.path)}
              >
                <span className="vd-quick-icon">{action.icon}</span>
                <span className="vd-quick-label">{action.label}</span>
                <span className="vd-quick-desc">{action.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Perfil + atividade recente */}
        <div className="vd-bottom-section">
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
                      ? <>Ativa{subscriptionDate && <span className="vd-sub-date"> · até {subscriptionDate}</span>}</>
                      : 'Inativa'}
                  </span>
                </div>
                <button type="button" className="vd-edit-btn" onClick={openProfileModal}>
                  <FiEdit2 size={13} /> Editar
                </button>
              </div>

              <div className="vd-profile-divider" />

              <div className="vd-profile-details">
                <div className="vd-detail-row">
                  <span className="vd-detail-row-icon"><FiMail /></span>
                  <span className="vd-detail-row-label">Email</span>
                  <span className="vd-detail-row-value">{vendor.email}</span>
                </div>
                <div className="vd-detail-row">
                  <span className="vd-detail-row-icon">
                    <span className="vd-pin-dot" style={{ backgroundColor: pinColor }} />
                  </span>
                  <span className="vd-detail-row-label">Cor do pin</span>
                  <span className="vd-detail-row-value" />
                </div>
                {vendor.payment_methods && (
                  <div className="vd-detail-row vd-detail-row-payments">
                    <span className="vd-detail-row-icon"><FiCreditCard /></span>
                    <span className="vd-detail-row-label">Pagamentos</span>
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

          <div className="vd-activity-card">
            <div className="vd-activity-card-title">
              <span>Atividade recente</span>
              {recentRoutes.length > 0 && (
                <Link to="/routes" className="vd-activity-view-all">Ver tudo</Link>
              )}
            </div>
            {routes === null && (
              <div className="vd-activity-empty">A carregar atividade…</div>
            )}
            {routes !== null && recentRoutes.length === 0 && (
              <div className="vd-activity-empty">
                Ainda não tens trajetos registados. Ativa a partilha de localização para
                começares a registar a tua atividade.
              </div>
            )}
            {recentRoutes.length > 0 && (
              <div className="vd-activity-items">
                {recentRoutes.map((r) => {
                  const ongoing = !r.end_time;
                  const duration = ongoing
                    ? Date.now() - new Date(r.start_time).getTime()
                    : new Date(r.end_time) - new Date(r.start_time);
                  return (
                    <Link to="/routes" key={r.id ?? r.start_time} className="vd-activity-item">
                      <div className="vd-activity-item-icon"><FiNavigation size={14} /></div>
                      <div className="vd-activity-item-content">
                        <div className="vd-activity-item-title">
                          {ongoing
                            ? 'Sessão em curso'
                            : `Sessão de ${formatDuration(duration)} · ${formatDistance(r.distance_m || 0)}`}
                        </div>
                        <div className="vd-activity-item-time">{relativeTime(r.start_time)}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Dicas */}
        <div className="vd-tips-card">
          <div className="vd-tips-title">💡 Dicas para vendedores</div>
          <div className="vd-tips-items">
            <div className="vd-tip-item">
              <div className="vd-tip-item-icon">✓</div>
              <div>Mantém a partilha de localização ativa para apareceres no mapa</div>
            </div>
            <div className="vd-tip-item">
              <div className="vd-tip-item-icon">✓</div>
              <div>Atualiza os teus produtos e métodos de pagamento regularmente</div>
            </div>
            <div className="vd-tip-item">
              <div className="vd-tip-item-icon">✓</div>
              <div>Uma foto de perfil ajuda os banhistas a reconhecer-te</div>
            </div>
            <div className="vd-tip-item">
              <div className="vd-tip-item-icon">✓</div>
              <div>O maior movimento na praia é entre as 15h e as 19h</div>
            </div>
          </div>
          <div className="vd-tips-footer">
            <Link to="/faqs" className="vd-tips-learn-more">Ver perguntas frequentes →</Link>
          </div>
        </div>

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
                className={`vd-modal-tab${profileTab === 'aparencia' ? ' active' : ''}`}
                onClick={() => setProfileTab('aparencia')}
              >
                <FiUser size={14} /> Aparência
              </button>
              <button
                type="button"
                className={`vd-modal-tab${profileTab === 'dados-pessoais' ? ' active' : ''}`}
                onClick={() => setProfileTab('dados-pessoais')}
              >
                <FiFileText size={14} /> Dados Pessoais
              </button>
              <button
                type="button"
                className={`vd-modal-tab${profileTab === 'seguranca' ? ' active' : ''}`}
                onClick={() => setProfileTab('seguranca')}
              >
                <FiLock size={14} /> Segurança
              </button>
            </div>

            {profileTab === 'aparencia' && (
              <form className="vd-modal-form" onSubmit={saveAppearance}>
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
                  <label className="vd-modal-label">Cor do Pin</label>
                  <PinColorPicker value={editPinColor} onChange={setEditPinColor} />
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
                  <label className="vd-modal-label">Métodos de pagamento aceites</label>
                  <div className="vd-modal-payments-grid">
                    {Object.keys(PAYMENT_ICONS).map((method) => (
                      <button
                        type="button"
                        key={method}
                        className={`vd-modal-payment-chip${editPaymentMethods.includes(method) ? ' active' : ''}`}
                        onClick={() => togglePaymentMethod(method)}
                      >
                        <span className="vd-modal-payment-chip-icon">{PAYMENT_ICONS[method]}</span>
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {editError && <p className="vd-modal-error">{editError}</p>}
                {editSuccess && (
                  <p className="vd-modal-success">
                    <FiCheck size={14} /> {editSuccess}
                  </p>
                )}

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

            {profileTab === 'dados-pessoais' && (
              <form className="vd-modal-form" onSubmit={savePersonalData}>
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
                  <label className="vd-modal-label">NIF</label>
                  <input
                    className="vd-modal-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="123456789"
                    value={editNif}
                    onChange={e => setEditNif(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <div className="vd-modal-field">
                  <label className="vd-modal-label">Telemóvel</label>
                  <input
                    className="vd-modal-input"
                    type="tel"
                    placeholder="912345678"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                  />
                </div>

                {personalError && <p className="vd-modal-error">{personalError}</p>}
                {personalSuccess && (
                  <p className="vd-modal-success">
                    <FiCheck size={14} /> {personalSuccess}
                  </p>
                )}

                <div className="vd-modal-actions">
                  <button type="button" className="vd-modal-cancel" onClick={closeProfileModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="vd-modal-save" disabled={personalSaving}>
                    {personalSaving ? 'A guardar…' : 'Guardar'}
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
