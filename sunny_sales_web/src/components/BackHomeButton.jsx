import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

// Botão de voltar global: é renderizado uma única vez no layout (App.jsx),
// por baixo da navbar, para ficar sempre no mesmo sítio em todas as páginas.
//
// Quem chega diretamente a uma página (pelo QR code do vendedor, por um link
// partilhado ou por uma pesquisa) não tem página anterior no site: o
// navigate(-1) levava-o para fora — ou não fazia nada num separador novo. O
// react-router guarda em `history.state.idx` a posição na pilha desta visita;
// com 0 não há para onde voltar dentro do site e o botão leva ao início.
export default function BackHomeButton() {
  const navigate = useNavigate();
  const goBack = () => {
    const idx = window.history.state?.idx;
    if (typeof idx === 'number' && idx > 0) navigate(-1);
    else navigate('/');
  };
  return (
    <div className="back-btn-row">
      <button type="button" className="back-btn" onClick={goBack}>
        <FiArrowLeft size={16} /> Voltar
      </button>
    </div>
  );
}
