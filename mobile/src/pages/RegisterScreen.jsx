import React, { useState } from 'react';
import { FiArrowLeft, FiCamera, FiCheck } from 'react-icons/fi';
import { BASE_URL } from '../config.js';
import ImageCropper from '../components/ImageCropper';

const PRODUCTS = ['Bolas de Berlim', 'Gelados', 'Acessórios de Praia'];
const STEP_TITLES = ['Identificação', 'Atividade', 'Confirmação'];
const TOTAL_STEPS = STEP_TITLES.length;

// (em português) Valida o NIF português (9 dígitos + dígito de controlo),
// com as mesmas regras do backend para evitar idas ao servidor sem necessidade.
function isValidNif(nif) {
  if (!/^\d{9}$/.test(nif)) return false;
  if (!'12356789'.includes(nif[0])) return false;
  let check = 0;
  for (let i = 0; i < 8; i += 1) check += Number(nif[i]) * (9 - i);
  const remainder = check % 11;
  const control = remainder < 2 ? 0 : 11 - remainder;
  return Number(nif[8]) === control;
}

// (em português) Mesmas regras de `validate_password` no backend.
function isValidPassword(password) {
  return password.length >= 8 && password.toLowerCase() !== password && /\d/.test(password);
}

export default function RegisterScreen({ onBack, onRegistered }) {
  const [step, setStep] = useState(1);

  const [name, setName] = useState('');
  const [nif, setNif] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [product, setProduct] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [emailSent, setEmailSent] = useState(true);
  const [resending, setResending] = useState(false);
  const [info, setInfo] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setCropSrc(URL.createObjectURL(file));
    e.target.value = '';
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

  const validateStep = (current) => {
    setError('');
    if (current === 1) {
      if (!name || !nif || !email || !phone || !password) {
        setError('Preenche todos os campos de identificação.');
        return false;
      }
      if (!isValidNif(nif)) {
        setError('NIF inválido. Confirma os 9 dígitos.');
        return false;
      }
      if (!isValidPassword(password)) {
        setError('A palavra-passe precisa de 8 caracteres, uma maiúscula e um número.');
        return false;
      }
    } else if (current === 2) {
      if (!product) {
        setError('Escolhe o produto principal.');
        return false;
      }
      if (!photo) {
        setError('Adiciona uma foto de perfil.');
        return false;
      }
    } else if (current === 3 && !termsAccepted) {
      setError('É necessário aceitar os Termos e Condições.');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const prevStep = () => {
    setError('');
    if (step === 1) {
      onBack();
      return;
    }
    setStep((s) => Math.max(s - 1, 1));
  };

  const submitRegistration = async () => {
    if (submitting || !validateStep(TOTAL_STEPS)) return;

    setSubmitting(true);
    setError('');
    try {
      const data = new FormData();
      data.append('name', name);
      data.append('email', email);
      data.append('password', password);
      data.append('product', product);
      data.append('profile_photo', new File([photo], 'profile.jpg', { type: 'image/jpeg' }));
      data.append('nif', nif);
      data.append('phone', phone);
      data.append('business_name', businessName);
      data.append('terms_accepted', 'true');

      const res = await fetch(`${BASE_URL}/vendors/`, { method: 'POST', body: data });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        const detail = payload?.detail;
        if (Array.isArray(detail)) throw new Error(detail.map((d) => d.msg).join('; '));
        throw new Error(detail || `Erro ${res.status} ao registar. Tenta novamente.`);
      }
      setEmailSent(payload?.email_sent !== false);
      setRegistered(true);
    } catch (err) {
      setError(err.message || 'Não foi possível concluir o registo. Verifica a ligação à internet.');
    } finally {
      setSubmitting(false);
    }
  };

  // O botão de avançar e o de submeter partilham a mesma posição, por isso são
  // ambos `type="button"`: um `type="submit"` reutilizaria o nó do passo
  // anterior e o browser submeteria o formulário logo ao mudar de passo.
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (step < TOTAL_STEPS) {
      nextStep();
      return;
    }
    submitRegistration();
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setInfo('');
    try {
      const res = await fetch(`${BASE_URL}/vendors/resend-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.detail || 'Não foi possível reenviar o email.');
      setEmailSent(true);
      setInfo('Email de confirmação reenviado.');
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  if (registered) {
    return (
      <div className="screen register-screen">
        <div className="reg-card reg-success">
          <div className="reg-success-icon"><FiCheck /></div>
          <h2 className="reg-title">Conta criada</h2>
          <p className="reg-success-msg">
            {emailSent
              ? `Enviámos um email para ${email}. Confirma a conta para poderes iniciar sessão e partilhar a localização.`
              : 'A conta foi criada, mas não foi possível enviar o email de confirmação.'}
          </p>
          {info && <div className="info-msg">{info}</div>}
          {error && <div className="error-msg">{error}</div>}
          {!emailSent && (
            <button type="button" className="btn btn-secondary" onClick={handleResend} disabled={resending}>
              {resending ? 'A reenviar…' : 'Reenviar email de confirmação'}
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={() => onRegistered(email)}>
            Iniciar sessão
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen register-screen">
      <div className="auth-topbar">
        <button type="button" className="btn-icon auth-back" onClick={prevStep} title="Voltar">
          <FiArrowLeft />
        </button>
        <span className="auth-topbar-title">Registo de vendedor</span>
      </div>

      <div className="reg-steps">
        {STEP_TITLES.map((title, i) => (
          <div className="reg-step" key={title}>
            <span className={`reg-step-dot${step > i + 1 ? ' done' : ''}${step === i + 1 ? ' active' : ''}`}>
              {step > i + 1 ? <FiCheck /> : i + 1}
            </span>
            <span className={`reg-step-label${step === i + 1 ? ' active' : ''}`}>{title}</span>
          </div>
        ))}
      </div>

      <form className="reg-card" onSubmit={handleFormSubmit}>
        {step === 1 && (
          <>
            <div className="input-group">
              <label>Nome completo</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" autoComplete="name" />
            </div>
            <div className="input-group">
              <label>NIF</label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={9}
                value={nif}
                onChange={(e) => setNif(e.target.value.replace(/\D/g, ''))}
                placeholder="123456789"
              />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="o-teu@email.com" autoComplete="email" />
            </div>
            <div className="input-group">
              <label>Telemóvel</label>
              <input type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="912345678" autoComplete="tel" />
            </div>
            <div className="input-group">
              <label>Palavra-passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
              <span className="input-hint">Mínimo 8 caracteres, uma maiúscula e um número.</span>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="input-group">
              <label>Produto principal</label>
              <select value={product} onChange={(e) => setProduct(e.target.value)}>
                <option value="">Escolhe um produto</option>
                {PRODUCTS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Nome da atividade</label>
              <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Opcional" />
            </div>
            <div className="input-group">
              <label>Foto de perfil</label>
              <label className="reg-photo">
                {photoPreview ? (
                  <img src={photoPreview} alt="Pré-visualização da foto de perfil" className="reg-photo-preview" />
                ) : (
                  <span className="reg-photo-placeholder"><FiCamera /></span>
                )}
                <span className="reg-photo-text">{photo ? 'Trocar foto' : 'Escolher foto'}</span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
              </label>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="reg-summary">
              <p><strong>Nome</strong><span>{name}</span></p>
              <p><strong>NIF</strong><span>{nif}</span></p>
              <p><strong>Email</strong><span>{email}</span></p>
              <p><strong>Telemóvel</strong><span>{phone}</span></p>
              <p><strong>Produto</strong><span>{product}</span></p>
              {businessName && <p><strong>Atividade</strong><span>{businessName}</span></p>}
            </div>
            <div className="reg-terms">
              <h4>Termos e Condições</h4>
              <p>Ao registares-te como vendedor no Sunny Sales, declaras e aceitas que:</p>
              <ol>
                <li>Todos os dados fornecidos são verdadeiros e estão atualizados.</li>
                <li>A tua localização é partilhada publicamente apenas enquanto ativares a partilha.</li>
                <li>A plataforma pode suspender contas com dados inválidos ou que violem estes termos.</li>
                <li>Os dados pessoais são tratados de acordo com o RGPD e a legislação portuguesa.</li>
                <li>A plataforma não se responsabiliza por infrações cometidas pelo vendedor.</li>
              </ol>
            </div>
            <label className="reg-check">
              <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
              <span>Li e aceito os Termos e Condições</span>
            </label>
          </>
        )}

        {error && <div className="error-msg">{error}</div>}

        <div className="reg-actions">
          <button type="button" className="btn btn-secondary" onClick={prevStep} disabled={submitting}>
            {step === 1 ? 'Cancelar' : 'Anterior'}
          </button>
          {step < TOTAL_STEPS ? (
            <button key="next" type="button" className="btn btn-primary" onClick={nextStep}>
              Seguinte
            </button>
          ) : (
            <button
              key="submit"
              type="button"
              className="btn btn-primary"
              onClick={submitRegistration}
              disabled={submitting}
            >
              {submitting ? 'A registar…' : 'Criar conta'}
            </button>
          )}
        </div>
      </form>

      {cropSrc && (
        <ImageCropper src={cropSrc} onCancel={handleCropCancel} onComplete={handleCropComplete} />
      )}
    </div>
  );
}
