import React from 'react';
import BackHomeButton from '../components/BackHomeButton';

export default function SobreProjeto() {
  return (
    <div style={styles.container}>
      <BackHomeButton />
      <h2 style={styles.title}>Sobre o Projeto</h2>

      {/* (em português) Secção com 3 cartões lado a lado (responsivo) */}
      <section style={styles.cardsContainer}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Quem Somos</h3>
          <p style={styles.cardText}>
            O <strong>Sunny Sales</strong> conecta vendedores ambulantes de praia
            (bolas de Berlim, gelados, acessórios) a banhistas através de um
            mapa interativo em tempo real, integrando tradição e tecnologia para
            valorizar o comércio local.
          </p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Motivação</h3>
          <p style={styles.cardText}>
            Os consumidores têm dificuldade em encontrar vendedores. O Sunny
            Sales mostra os vendedores mais próximos, os produtos disponíveis e
            as avaliações de outros clientes, simplificando a experiência na
            praia.
          </p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Benefícios</h3>
          <ul style={styles.cardList}>
            <li>Evita procurar vendedores pela praia.</li>
            <li>Direciona vendedores ao público interessado.</li>
            <li>Promove organização e sustentabilidade balnear.</li>
          </ul>
        </div>
      </section>

      {/* (em português) Mensagem de fecho sob os cartões */}
      <p style={styles.footerText}>
        O Sunny Sales promove praticidade, sustentabilidade e a valorização do
        comércio local.
      </p>
    </div>
  );
}

/* (em português) Estilos inline: container, títulos e cartões (cards) */
const styles = {
  container: {
    padding: '2rem',
    maxWidth: 1000,
    margin: '0 auto',
    backgroundColor: 'var(--bg-color)',
    borderRadius: '8px',
    fontFamily: 'sans-serif',
    color: '#333',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  cardsContainer: {
    display: 'flex',
    gap: '24px',
    justifyContent: 'center',
    alignItems: 'stretch',
    flexWrap: 'wrap', // (em português) Empilha em ecrãs pequenos
    margin: '0 auto 1rem',
  },
  // (em português) Card baseado no estilo partilhado (Uiverse.io) com pequenas adaptações
  card: {
    width: '280px',
    minHeight: '260px',
    padding: '20px',
    borderRadius: '30px',
    background: '#fcb454',
    boxShadow: '15px 15px 30px #bebebe, -15px -15px 30px #ffffff',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  cardTitle: {
    margin: '0 0 12px 0',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#333',
  },
  cardText: {
    fontSize: '0.95rem',
    color: '#444',
    lineHeight: 1.5,
  },
  cardList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    fontSize: '0.95rem',
    color: '#444',
    lineHeight: 1.6,
  },
  footerText: {
    fontSize: '1rem',
    textAlign: 'center',
    marginTop: '1.2rem',
  },
};
