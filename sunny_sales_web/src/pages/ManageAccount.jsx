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
    <div className="form-box">
      <h2 className="title">Definições de Conta</h2>
      <div className="form">
        <div className="form-container">
          <input
            type="password"
            placeholder="Nova palavra-passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </div>
        <button type="button" onClick={changePassword}>
          Alterar Palavra-passe
        </button>
        <button
          type="button"
          style={{ backgroundColor: '#e74c3c', color: '#fff' }}
          onClick={deleteAccount}
        >
          Apagar Conta
        </button>
      </div>
    </div>
  );
}

// (em português) Estilos simples para a página
