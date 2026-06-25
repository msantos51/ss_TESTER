import './HowItWorks.css';

export default function HowItWorks() {
  return (
    <div className="how-it-works-container">
      {/* Header Section */}
      <section className="how-it-works-header">
        <h1>Como Funciona o Modelo</h1>
        <p className="subtitle">
          Conheça a plataforma de vendas na praia desenvolvida para maximizar os seus ganhos
        </p>
      </section>

      {/* Introduction Section */}
      <section className="how-it-works-intro">
        <div className="intro-content">
          <h2>Bem-vindo à Sunny Sales</h2>
          <p>
            A Sunny Sales é uma plataforma inovadora que conecta vendedores ambulantes com clientes
            nas praias. O nosso sistema permite que você gerencie rotas, rastreie vendas e maximize
            os seus lucros de forma inteligente.
          </p>
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="how-it-works-steps">
        <h2>Passo a Passo</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Crie sua Conta</h3>
            <p>
              Registe-se como vendedor na plataforma e complete o seu perfil
              com as informações necessárias.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Defina suas Rotas</h3>
            <p>
              Crie e personalize suas rotas de venda nas praias onde deseja operar.
              Escolha áreas estratégicas.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Inicie suas Vendas</h3>
            <p>
              Acesse a aplicação mobile e comece a vender nas suas rotas.
              Rastreie os clientes em tempo real.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Acompanhe Estatísticas</h3>
            <p>
              Veja relatórios detalhados das suas vendas, ganhos e performance
              com dashboards intuitivos.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="how-it-works-features">
        <h2>Principais Funcionalidades</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">📍</div>
            <h3>Rastreamento de Rotas</h3>
            <p>
              Visualize suas rotas em tempo real com mapa interativo
              e dados de performance.
            </p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">📊</div>
            <h3>Analytics e Relatórios</h3>
            <p>
              Analise dados detalhados sobre suas vendas, lucros
              e comportamento de clientes.
            </p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">💰</div>
            <h3>Pagamentos Simples</h3>
            <p>
              Sistema seguro de pagamento com transferências rápidas
              e transparentes.
            </p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">📱</div>
            <h3>App Mobile Intuitiva</h3>
            <p>
              Aplicação fácil de usar, otimizada para dispositivos móveis
              com bateria eficiente.
            </p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">🌍</div>
            <h3>Sustentabilidade</h3>
            <p>
              Envolvido em iniciativas ambientais para praias mais limpas
              e um planeta melhor.
            </p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">🤝</div>
            <h3>Suporte 24/7</h3>
            <p>
              Equipa dedicada pronta para ajudar com qualquer dúvida
              ou problema técnico.
            </p>
          </div>
        </div>
      </section>

      {/* App Mockups Section */}
      <section className="how-it-works-mockups">
        <h2>Conheça a Aplicação</h2>
        <p className="mockups-subtitle">
          Aqui você encontrará mockups e demonstrações visuais da aplicação mobile
        </p>

        <div className="mockups-container">
          <div className="mockup-placeholder">
            <div className="mockup-content">
              <h3>Tela de Início</h3>
              <p>Espaço reservado para mockup da tela inicial da aplicação</p>
              <p className="placeholder-text">Visualização da interface de boas-vindas</p>
            </div>
          </div>

          <div className="mockup-placeholder">
            <div className="mockup-content">
              <h3>Mapa de Rotas</h3>
              <p>Espaço reservado para mockup do mapa interativo</p>
              <p className="placeholder-text">Visualização de rotas e localização</p>
            </div>
          </div>

          <div className="mockup-placeholder">
            <div className="mockup-content">
              <h3>Dashboard de Vendas</h3>
              <p>Espaço reservado para mockup do dashboard</p>
              <p className="placeholder-text">Visualização de estatísticas e ganhos</p>
            </div>
          </div>

          <div className="mockup-placeholder">
            <div className="mockup-content">
              <h3>Funcionalidades</h3>
              <p>Espaço reservado para mockup de funcionalidades adicionais</p>
              <p className="placeholder-text">Demais ferramentas da plataforma</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="how-it-works-benefits">
        <h2>Por que Escolher a Sunny Sales?</h2>
        <div className="benefits-list">
          <div className="benefit-item">
            <span className="benefit-check">✓</span>
            <div className="benefit-text">
              <h3>Ganhos Aumentados</h3>
              <p>Maximize seus lucros com rotas inteligentes e dados em tempo real</p>
            </div>
          </div>

          <div className="benefit-item">
            <span className="benefit-check">✓</span>
            <div className="benefit-text">
              <h3>Gestão Fácil</h3>
              <p>Interface simples e intuitiva que qualquer um consegue usar</p>
            </div>
          </div>

          <div className="benefit-item">
            <span className="benefit-check">✓</span>
            <div className="benefit-text">
              <h3>Transparência Total</h3>
              <p>Veja exatamente quanto ganhou e como está seu desempenho</p>
            </div>
          </div>

          <div className="benefit-item">
            <span className="benefit-check">✓</span>
            <div className="benefit-text">
              <h3>Comunidade Forte</h3>
              <p>Junte-se a uma rede de vendedores profissionais como você</p>
            </div>
          </div>

          <div className="benefit-item">
            <span className="benefit-check">✓</span>
            <div className="benefit-text">
              <h3>Confiabilidade</h3>
              <p>Plataforma segura com histórico comprovado de sucesso</p>
            </div>
          </div>

          <div className="benefit-item">
            <span className="benefit-check">✓</span>
            <div className="benefit-text">
              <h3>Responsabilidade Ambiental</h3>
              <p>Venda com consciência, apoiando a preservação das praias</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="how-it-works-cta">
        <h2>Comece Agora</h2>
        <p>
          Junte-se aos nossos vendedores e transforme o seu negócio na praia
        </p>
        <a href="#/vendor-register" className="cta-button">
          Registar como Vendedor
        </a>
      </section>
    </div>
  );
}
