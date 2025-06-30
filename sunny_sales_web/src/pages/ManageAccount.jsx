// (em português) Página Web para gestão de conta (alterar/remover conta)

import React, { useState } from 'react';

export default function ManageAccount() {
  const [password, setPassword] = useState('');

  // (em português) Alerta para funcionalidade ainda não implementada
  const changePassword = () => {
    alert('Funcionalidade indisponível');
  };

  const deleteAccount = () => {
    alert('Funcionalidade indisponível');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Definições de Conta</h2>

      <input
        type="password"
        placeholder="Nova palavra-passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />

      <button onClick={changePassword} style={styles.button}>
        Alterar Palavra-passe
      </button>

      <button onClick={deleteAccount} style={{ ...styles.button, backgroundColor: '#e74c3c' }}>
        Apagar Conta
      </button>
    </div>
  );
}

// (em português) Estilos simples para a página
const styles = {
  container: {
    maxWidth: '400px',
    margin: '3rem auto',
    padding: '2rem',
    border: '1px solid #ccc',
    borderRadius: '12px',
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  title: {
    fontSize: '20px',
    marginBottom: '1.5rem',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '1.5rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
  },
  button: {
    width: '100%',
    padding: '10px',
    marginBottom: '1rem',
    backgroundColor: '#FDC500',
    color: '#000',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};
