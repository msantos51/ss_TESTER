import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import ImageCropper from '../components/ImageCropper';
import './VendorRegister.css';

export default function VendorRegister() {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [product, setProduct] = useState('');
  const [photo, setPhoto] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);

  const [nif, setNif] = useState('');
  const [idDocumentNumber, setIdDocumentNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [businessName, setBusinessName] = useState('');

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailSent, setEmailSent] = useState(true);
  const [resending, setResending] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCropSrc(URL.createObjectURL(file));
    }
  };

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const handleCropComplete = (blob) => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setPhoto(blob);
  };

  const validateStep = (s) => {
    setError('');
    if (s === 1) {
      if (!name || !email || !password || !nif || !idDocumentNumber || !phone || !address) {
        setError('Preencha todos os campos de identificação.');
        return false;
      }
      if (password.length < 8 || password.toLowerCase() === password || !/\d/.test(password)) {
        setError('A palavra-passe deve ter pelo menos 8 caracteres, uma letra maiúscula e um número.');
        return false;
      }
      if (nif.length !== 9 || !/^\d{9}$/.test(nif)) {
        setError('O NIF deve ter exatamente 9 dígitos.');
        return false;
      }
      if (!'12356789'.includes(nif[0])) {
        setError('NIF inválido.');
        return false;
      }
      {
        let check = 0;
        for (let i = 0; i < 8; i++) check += parseInt(nif[i]) * (9 - i);
        const remainder = check % 11;
        const control = remainder < 2 ? 0 : 11 - remainder;
        if (parseInt(nif[8]) !== control) {
          setError('NIF inválido (dígito de controlo incorreto).');
          return false;
        }
      }
    } else if (s === 2) {
      if (!product) {
        setError('Selecione um produto principal.');
        return false;
      }
      if (!photo) {
        setError('É necessária uma foto de perfil.');
        return false;
      }
    } else if (s === 3) {
      if (!termsAccepted) {
        setError('É necessário aceitar os Termos e Condições.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, totalSteps));
  };

  const prevStep = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSuccess('');

    if (!validateStep(3)) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('product', product);
      formData.append('profile_photo', new File([photo], 'profile.jpg', { type: 'image/jpeg' }));
      formData.append('nif', nif);
      formData.append('id_document_number', idDocumentNumber);
      formData.append('phone', phone);
      formData.append('address', address);
      formData.append('business_name', businessName);
      formData.append('terms_accepted', 'true');

      const res = await axios.post(`${BASE_URL}/vendors/`, formData, { timeout: 30000 });
      const sent = res.data?.email_sent !== false;
      setEmailSent(sent);
      setSuccess(
        sent
          ? 'Registo efetuado com sucesso! Verifique o seu email para confirmar a conta.'
          : 'Registo efetuado com sucesso! Não foi possível enviar o email de confirmação.'
      );
    } catch (err) {
      console.error('Erro:', err);
      console.error('Resposta do servidor:', err.response?.data);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((e) => e.msg).join('; '));
      } else if (detail) {
        setError(detail);
      } else if (err.response) {
        setError(`Erro ${err.response.status} ao registar. Tente novamente.`);
      } else if (err.code === 'ECONNABORTED') {
        setError('O pedido demorou demasiado tempo. Tente novamente.');
      } else {
        setError('Não foi possível concluir o registo. Verifique a sua ligação à internet e tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const stepTitles = [
    'Identificação',
    'Dados Operacionais',
    'Confirmação',
  ];

  const renderProgressBar = () => (
    <div className="vr-progress-bar">
      {stepTitles.map((title, i) => (
        <div key={i} className="vr-progress-step">
          <div className={`vr-progress-circle${step > i ? ' completed' : step === i + 1 ? ' active' : ''}`}>
            {step > i ? '✓' : i + 1}
          </div>
          <span className={`vr-progress-label${step === i + 1 ? ' active' : ''}`}>
            {title}
          </span>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <>
      <h3 className="vr-step-title">Identificação e Contacto</h3>
      <span className="input-span">
        <label className="label">Nome Completo *</label>
        <input type="text" placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
      </span>
      <span className="input-span">
        <label className="label">NIF *</label>
        <input type="text" placeholder="123456789" maxLength={9} value={nif} onChange={(e) => setNif(e.target.value.replace(/\D/g, ''))} />
      </span>
      <span className="input-span">
        <label className="label">N.º Documento de Identidade (CC/BI) *</label>
        <input type="text" placeholder="N.º do documento" value={idDocumentNumber} onChange={(e) => setIdDocumentNumber(e.target.value)} />
      </span>
      <span className="input-span">
        <label className="label">Email *</label>
        <input type="email" placeholder="email@exemplo.pt" value={email} onChange={(e) => setEmail(e.target.value)} />
      </span>
      <span className="input-span">
        <label className="label">Telemóvel *</label>
        <input type="tel" placeholder="912345678" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </span>
      <span className="input-span">
        <label className="label">Morada *</label>
        <input type="text" placeholder="Rua, número, código postal, localidade" value={address} onChange={(e) => setAddress(e.target.value)} />
      </span>
      <span className="input-span">
        <label className="label">Palavra-passe *</label>
        <input type="password" placeholder="Mín. 8 caracteres, 1 maiúscula, 1 número" value={password} onChange={(e) => setPassword(e.target.value)} />
      </span>
    </>
  );

  const renderStep2 = () => (
    <>
      <h3 className="vr-step-title">Dados Operacionais</h3>
      <span className="input-span">
        <label className="label">Produto Principal *</label>
        <select value={product} onChange={(e) => setProduct(e.target.value)}>
          <option value="">Selecione um produto</option>
          <option value="Bolas de Berlim">Bolas de Berlim</option>
          <option value="Gelados">Gelados</option>
          <option value="Acessórios de Praia">Acessórios de Praia</option>
        </select>
      </span>
      <span className="input-span">
        <label className="label">Nome da Atividade / Firma</label>
        <input type="text" placeholder="Nome comercial (opcional)" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
      </span>
      <span className="input-span">
        <label className="label">Foto de Perfil *</label>
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
        {photo && <span className="vr-file-feedback">Foto selecionada</span>}
      </span>
    </>
  );

  const renderStep3 = () => (
    <>
      <h3 className="vr-step-title">Confirmação e Termos</h3>
      <div className="vr-summary-box">
        <p><strong>Nome:</strong> {name}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>NIF:</strong> {nif}</p>
        <p><strong>Telemóvel:</strong> {phone}</p>
        <p><strong>Produto:</strong> {product}</p>
        {businessName && <p><strong>Firma:</strong> {businessName}</p>}
      </div>
      <div className="vr-terms-scroll">
        <h4>Termos e Condições</h4>
        <p>Ao registar-se como vendedor na plataforma Sunny Sales, declara e aceita que:</p>
        <ol>
          <li>Possui licença de venda válida emitida pela câmara municipal competente.</li>
          <li>Todos os dados fornecidos são verdadeiros e atualizados.</li>
          <li>É responsável por manter a licença válida e atualizada na plataforma.</li>
          <li>A plataforma reserva-se o direito de suspender contas com licenças expiradas ou dados inválidos.</li>
          <li>Os dados pessoais serão tratados de acordo com o RGPD e a legislação portuguesa.</li>
          <li>A plataforma não se responsabiliza por infrações cometidas pelo vendedor.</li>
          <li>Aceita receber comunicações relacionadas com a operação da plataforma.</li>
        </ol>
      </div>
      <label className="vr-checkbox-label">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="vr-checkbox"
        />
        Li e aceito os Termos e Condições *
      </label>
    </>
  );

  const handleResend = async () => {
    setResending(true);
    try {
      await axios.post(`${BASE_URL}/vendors/resend-confirmation`, { email });
      setEmailSent(true);
      setSuccess('Registo efetuado com sucesso! Verifique o seu email para confirmar a conta.');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || 'Não foi possível reenviar o email. Tente novamente.');
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="form-box vr-success">
        <h2 className="title auth-title">Registo de Vendedor</h2>
        <p className="vr-success-msg">{success}</p>
        {!emailSent && (
          <button
            type="button"
            onClick={handleResend}
            className="submit vr-btn-next"
            disabled={resending}
            style={{ marginBottom: '16px' }}
          >
            {resending ? 'A reenviar...' : 'Reenviar email de confirmação'}
          </button>
        )}
        {error && <p className="vr-error">{error}</p>}
        <a href="/vendor-login" className="vr-login-link">Ir para o login</a>
      </div>
    );
  }

  return (
    <div className="form-box vr-form-box">
      <h2 className="title auth-title">Registo de Vendedor</h2>

      {renderProgressBar()}

      {error && <p className="vr-error">{error}</p>}

      <form onSubmit={handleRegister} className="form login-form auth-form">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <div className="vr-btn-row">
          {step > 1 && (
            <button type="button" onClick={prevStep} className="submit vr-btn-prev">
              Anterior
            </button>
          )}
          {step < totalSteps ? (
            <button type="button" onClick={nextStep} className="submit vr-btn-next">
              Seguinte
            </button>
          ) : (
            <button type="submit" className="submit vr-btn-next" disabled={submitting}>
              {submitting ? 'A registar...' : 'Registar'}
            </button>
          )}
        </div>
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
