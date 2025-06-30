// (em português) Página "Sobre e Ajuda" com estilos embutidos

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    minHeight: '100vh',
    backgroundColor: '#f6f6f6',
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
    borderRadius: '8px',
    backgroundColor: '#f9c200',
    color: 'black',
    fontSize: '1rem',
    cursor: 'pointer',
  }
};

export default function About() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Sobre e Ajuda</h2>
        <hr />
        <button
          style={styles.button}
          onClick={() => (window.location.href = '/terms')}
        >
          📄 Termos e Condições
        </button>
        <button
          style={styles.button}
          onClick={() => (window.location.href = 'mailto:suporte@sunnysales.com')}
        >
          📧 Contactar Suporte
        </button>
      </div>
    </div>
  );
}
