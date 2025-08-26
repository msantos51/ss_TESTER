// (em português) Página "Sobre e Ajuda" com estilos embutidos
import React from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color)',
  },
  card: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
  },
  button: {
    display: 'block',
    width: '100%',
    padding: '0.75rem',
    margin: '1rem 0',
    border: 'none',
    backgroundColor: '#19a0a4',
    color: 'black',
    fontSize: '1rem',
    cursor: 'pointer',
  }
};

// Página informativa sobre a aplicação
export default function About() {
  const navigate = useNavigate();
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Sobre e Ajuda</h2>
        <hr />
        <button
          className="btn"
          style={styles.button}
          onClick={() => navigate('/terms')}
        >
          📄 Termos e Condições
        </button>
        <button
          className="btn"
          style={styles.button}
          onClick={() => (window.location.href = 'mailto:suporte@sunnysales.com')}
        >
          📧 Contactar Suporte
        </button>
      </div>
    </div>
  );
}
