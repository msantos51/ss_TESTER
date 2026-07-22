import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();
  return (
    <div className="page-wrapper">
      <h2>Sobre e Ajuda</h2>

      <ul className="page-list">
        <li className="page-list-item" onClick={() => navigate('/terms')}>
          <div className="page-list-item-main">
            <span className="page-list-item-title">Termos e Condições</span>
            <span className="page-list-item-desc">Consulte os termos de utilização</span>
          </div>
          <span className="page-chevron">›</span>
        </li>
        <li
          className="page-list-item"
          onClick={() => { window.location.href = 'mailto:sunnysales.geral@gmail.com'; }}
        >
          <div className="page-list-item-main">
            <span className="page-list-item-title">Contactar Suporte</span>
            <span className="page-list-item-desc">sunnysales.geral@gmail.com</span>
          </div>
          <span className="page-chevron">›</span>
        </li>
      </ul>
    </div>
  );
}
