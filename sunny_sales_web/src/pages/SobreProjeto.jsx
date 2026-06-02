import React from 'react';
import BackHomeButton from '../components/BackHomeButton';
import './InfoPage.css';

export default function SobreProjeto() {
  return (
    <div className="info-page">
      <BackHomeButton />

      <div className="info-hero">
        <h1 className="info-hero-title">Sobre o Projeto</h1>
        <p className="info-hero-lead">
          O <strong>Sunny Sales</strong> conecta vendedores ambulantes de praia a banhistas
          através de um mapa interativo em tempo real — unindo tradição, tecnologia e
          sustentabilidade nas praias portuguesas.
        </p>
      </div>

      <div className="info-badges">
        <div className="info-badge">
          <span className="info-badge-value">🏖️</span> Praias portuguesas
        </div>
        <div className="info-badge">
          <span className="info-badge-value">📍</span> Localização em tempo real
        </div>
        <div className="info-badge">
          <span className="info-badge-value">📱</span> Web &amp; Mobile
        </div>
      </div>

      <div className="info-cards">
        <div className="info-card accent">

          <h3 className="info-card-title">Quem Somos</h3>
          <p className="info-card-text">
            Somos uma plataforma digital que valoriza o comércio ambulante tradicional de praia —
            desde bolas de Berlim e gelados até acessórios e bebidas. Integramos tradição e
            tecnologia para que nenhum vendedor ou banhista fique sem se encontrar.
          </p>
        </div>

        <div className="info-card">

          <h3 className="info-card-title">A Nossa Motivação</h3>
          <p className="info-card-text">
            Os banhistas perdem tempo a procurar vendedores pela areia e os vendedores percorrem
            longas distâncias sem saber onde estão os clientes. O Sunny Sales resolve este
            problema em tempo real, tornando a experiência mais prática para todos.
          </p>
        </div>

        <div className="info-card">

          <h3 className="info-card-title">Benefícios</h3>
          <ul className="info-card-list">
            <li>Menos tempo a procurar vendedores na praia</li>
            <li>Vendedores direcionados ao público certo</li>
            <li>Menos deslocações desnecessárias</li>
            <li>Comércio local mais organizado e visível</li>
            <li>Promoção da sustentabilidade balnear</li>
          </ul>
        </div>
      </div>

      <div className="info-section">
        <h3 className="info-section-title">Como Funciona</h3>
        <ul className="info-timeline">
          <li>
            <div className="info-timeline-number">1</div>
            <div className="info-timeline-body">
              O vendedor abre a aplicação e ativa a localização — fica imediatamente visível
              no mapa para todos os banhistas nas proximidades.
            </div>
          </li>
          <li>
            <div className="info-timeline-number">2</div>
            <div className="info-timeline-body">
              O banhista acede ao mapa, filtra por tipo de produto e vê os vendedores mais
              próximos em tempo real.
            </div>
          </li>
          <li>
            <div className="info-timeline-number">3</div>
            <div className="info-timeline-body">
              O vendedor passa e o banhista recebe o produto sem ter de se levantar — mais
              prático e eficiente para ambos.
            </div>
          </li>
        </ul>
      </div>

      <p className="info-footer-text">
        O Sunny Sales promove praticidade, sustentabilidade e a valorização do comércio local
        nas praias portuguesas.
      </p>
    </div>
  );
}
