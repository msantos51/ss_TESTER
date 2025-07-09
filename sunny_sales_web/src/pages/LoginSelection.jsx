import React from 'react';
import { useNavigate } from 'react-router-dom';

// Permite escolher o tipo de conta a iniciar sessão
export default function LoginSelection() {
  const navigate = useNavigate();
  return (
    <div style={styles.container}>
      <h2>Escolha o tipo de utilizador</h2>
      <div style={styles.buttons}>
        <button style={styles.button} onClick={() => navigate('/vendor-login')}>
          Sou Vendedor
        </button>
        <button style={styles.button} onClick={() => navigate('/login')}>
          Sou Cliente
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    textAlign: 'center',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '1rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#19a0a4',
    border: 'none',
    cursor: 'pointer',
  },
};
