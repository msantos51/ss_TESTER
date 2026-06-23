import { useState } from 'react';
import { FiMail, FiSend, FiCheckCircle, FiUser, FiMessageSquare } from 'react-icons/fi';
import BackHomeButton from '../components/BackHomeButton';
import { BASE_URL } from '../config';
import './InfoPage.css';
import './Contacto.css';

const ASSUNTOS = [
  'Informação geral',
  'Suporte técnico',
  'Parceria / Colaboração',
  'Reportar problema',
  'Outro',
];

export default function Contacto() {
  const [form, setForm] = useState({ nome: '', email: '', assunto: '', mensagem: '' });
  const [errors, setErrors] = useState({});
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.nome.trim()) e.nome = 'O nome é obrigatório.';
    if (!form.email.trim()) {
      e.email = 'O email é obrigatório.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Introduz um email válido.';
    }
    if (!form.assunto) e.assunto = 'Seleciona um assunto.';
    if (!form.mensagem.trim()) e.mensagem = 'A mensagem é obrigatória.';
    else if (form.mensagem.trim().length < 10) e.mensagem = 'A mensagem deve ter pelo menos 10 caracteres.';
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      // Enviar o pedido para o backend configurado, tanto em produção como em desenvolvimento.
      const response = await fetch(`${BASE_URL.replace(/\/$/, '')}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          assunto: form.assunto,
          mensagem: form.mensagem
        })
      });
      if (response.ok) {
        setLoading(false);
        setEnviado(true);
      } else {
        setLoading(false);
        const errorData = await response.json().catch(() => ({}));
        setErrors({ submit: errorData.detail || 'Erro ao enviar mensagem. Tenta novamente.' });
      }
    } catch (error) {
      setLoading(false);
      setErrors({ submit: 'Erro de conexão. Tenta novamente.' });
    }
  };

  const handleNovo = () => {
    setForm({ nome: '', email: '', assunto: '', mensagem: '' });
    setErrors({});
    setEnviado(false);
  };

  if (enviado) {
    return (
      <div className="info-page">
        <BackHomeButton />
        <div className="contacto-success">
          <FiCheckCircle className="contacto-success-icon" />
          <h2 className="contacto-success-title">Mensagem enviada!</h2>
          <p className="contacto-success-text">
            Obrigado por entrares em contacto. Responderemos ao teu email em breve.
          </p>
          <button className="contacto-btn" onClick={handleNovo}>
            Enviar nova mensagem
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="info-page">
      <BackHomeButton />

      <div className="info-hero">
        <h1 className="info-hero-title">Contacto</h1>
        <p className="info-hero-lead">
          Tens alguma questão, sugestão ou queres saber mais sobre o Sunny Sales?
          Preenche o formulário abaixo e entraremos em contacto contigo.
        </p>
      </div>

      <div className="info-badges">
        <div className="info-badge blue-text"><FiMail size={13} /> sunnysales.geral@gmail.com</div>
        <div className="info-badge blue-text">Resposta em 24–48 h</div>
        <div className="info-badge blue-text">Segunda a Sexta</div>
      </div>

      <div className="contacto-form-wrap">
        <form className="contacto-form" onSubmit={handleSubmit} noValidate>

          <div className="contacto-row">
            <div className={`contacto-field${errors.nome ? ' has-error' : ''}`}>
              <label className="contacto-label" htmlFor="c-nome">
                <FiUser size={14} /> Nome
              </label>
              <input
                id="c-nome"
                className="contacto-input"
                type="text"
                placeholder="O teu nome"
                value={form.nome}
                onChange={handleChange('nome')}
                autoComplete="name"
              />
              {errors.nome && <span className="contacto-error">{errors.nome}</span>}
            </div>

            <div className={`contacto-field${errors.email ? ' has-error' : ''}`}>
              <label className="contacto-label" htmlFor="c-email">
                <FiMail size={14} /> Email
              </label>
              <input
                id="c-email"
                className="contacto-input"
                type="email"
                placeholder="o.teu@email.com"
                value={form.email}
                onChange={handleChange('email')}
                autoComplete="email"
              />
              {errors.email && <span className="contacto-error">{errors.email}</span>}
            </div>
          </div>

          <div className={`contacto-field${errors.assunto ? ' has-error' : ''}`}>
            <label className="contacto-label" htmlFor="c-assunto">
              Assunto
            </label>
            <select
              id="c-assunto"
              className="contacto-input contacto-select"
              value={form.assunto}
              onChange={handleChange('assunto')}
            >
              <option value="">Seleciona um assunto…</option>
              {ASSUNTOS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            {errors.assunto && <span className="contacto-error">{errors.assunto}</span>}
          </div>

          <div className={`contacto-field${errors.mensagem ? ' has-error' : ''}`}>
            <label className="contacto-label" htmlFor="c-mensagem">
              <FiMessageSquare size={14} /> Mensagem
            </label>
            <textarea
              id="c-mensagem"
              className="contacto-input contacto-textarea"
              placeholder="Escreve a tua mensagem aqui…"
              value={form.mensagem}
              onChange={handleChange('mensagem')}
              rows={5}
            />
            <div className="contacto-chars">
              {form.mensagem.length} caracteres
            </div>
            {errors.mensagem && <span className="contacto-error">{errors.mensagem}</span>}
          </div>

          {errors.submit && <div className="contacto-error contacto-submit-error">{errors.submit}</div>}

          <button
            type="submit"
            className="contacto-btn contacto-btn-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="contacto-loading">A enviar…</span>
            ) : (
              <><FiSend size={15} /> Enviar mensagem</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
