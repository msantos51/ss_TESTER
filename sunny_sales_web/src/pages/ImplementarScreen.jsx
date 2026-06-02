import React from 'react';
import BackHomeButton from '../components/BackHomeButton';
import './InfoPage.css';

export default function ImplementarScreen() {
  return (
    <div className="info-page">
      <BackHomeButton />

      <div className="info-hero">
        <h1 className="info-hero-title">Implementação do Sunny Sales</h1>
        <p className="info-hero-lead">
          Uma solução tecnológica pronta a usar para <strong>autarquias, juntas de freguesia
          e entidades gestoras do litoral</strong> que pretendem modernizar a experiência
          balnear.
        </p>
      </div>

      <div className="info-badges">
        <div className="info-badge">
          <span className="info-badge-value">⚡</span> Implementação rápida
        </div>
        <div className="info-badge">
          <span className="info-badge-value">📊</span> Estatísticas incluídas
        </div>
        <div className="info-badge">
          <span className="info-badge-value">🔗</span> Acesso via QR Code
        </div>
      </div>

      <div className="info-cards">
        <div className="info-card accent">

          <h3 className="info-card-title">Vantagens para a Autarquia</h3>
          <ul className="info-card-list">
            <li>Organização eficiente da atividade ambulante</li>
            <li>Promoção do comércio local e sustentável</li>
            <li>Melhoria clara da experiência dos veraneantes</li>
            <li>Redução da circulação desnecessária na praia</li>
            <li>Reforço da imagem de inovação e modernidade</li>
            <li>Dados e estatísticas de utilização em tempo real</li>
          </ul>
        </div>

        <div className="info-card">

          <h3 className="info-card-title">Recursos Disponibilizados</h3>
          <ul className="info-card-list">
            <li>Mapa digital interativo com vendedores em tempo real</li>
            <li>Filtros por tipo de produto e categorias</li>
            <li>Acesso imediato via QR Code sem instalação</li>
            <li>Página personalizada por localidade ou praia</li>
            <li>Dashboard com estatísticas de utilização</li>
            <li>Suporte técnico e atualizações contínuas</li>
          </ul>
        </div>
      </div>

      <div className="info-section">
        <h3 className="info-section-title">Processo de Implementação</h3>
        <ul className="info-timeline">
          <li>
            <div className="info-timeline-number">1</div>
            <div className="info-timeline-body">
              <strong>Contacto inicial</strong> — Envie um e-mail para{' '}
              <a
                href="mailto:suporte@sunnysales.com"
                style={{ color: 'var(--primary)', fontWeight: 600 }}
              >
                suporte@sunnysales.com
              </a>{' '}
              com o nome da praia e município.
            </div>
          </li>
          <li>
            <div className="info-timeline-number">2</div>
            <div className="info-timeline-body">
              <strong>Demonstração</strong> — Agendaremos uma apresentação breve, presencial
              ou online, adaptada à realidade da vossa praia e necessidades locais.
            </div>
          </li>
          <li>
            <div className="info-timeline-number">3</div>
            <div className="info-timeline-body">
              <strong>Integração</strong> — Em poucos dias, a praia fica integrada no sistema,
              com QR Codes e acesso configurado para os vendedores locais.
            </div>
          </li>
        </ul>
      </div>

      <div className="info-cta">
        <div className="info-cta-title">Pronto para modernizar a sua praia?</div>
        <p className="info-cta-text">
          Estamos disponíveis para parcerias, protocolos institucionais e ações conjuntas.<br />
          Faça parte da transformação digital das praias portuguesas.
        </p>
        <a href="mailto:suporte@sunnysales.com" className="info-cta-btn">
          ✉️&nbsp; Entrar em contacto
        </a>
      </div>
    </div>
  );
}
