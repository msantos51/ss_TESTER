import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

// Botão de voltar global: é renderizado uma única vez no layout (App.jsx),
// por baixo da navbar, para ficar sempre no mesmo sítio em todas as páginas.
export default function BackHomeButton() {
  const navigate = useNavigate();
  return (
    <div className="back-btn-row">
      <button type="button" className="back-btn" onClick={() => navigate(-1)}>
        <FiArrowLeft size={16} /> Voltar
      </button>
    </div>
  );
}
