import React from 'react';

/**
 * Banner laranja de fecho, partilhado pelas páginas de conteúdo para manter
 * a mesma linguagem visual da página "Sobre o Projeto".
 *
 * Props:
 *  - icon: componente de ícone (react-icons) mostrado no círculo branco
 *  - title: título opcional a negrito
 *  - children: texto do banner
 *  - action: elemento opcional (ex.: botão/link) mostrado por baixo do texto
 */
export default function InfoBanner({ icon: Icon, title, children, action }) {
  return (
    <section className="info-banner">
      {Icon && (
        <span className="info-banner-icon">
          <Icon />
        </span>
      )}

      <div className="info-banner-body">
        {title && <p className="info-banner-title">{title}</p>}
        <p className="info-banner-text">{children}</p>
        {action}
      </div>

      <svg
        className="info-banner-decor"
        viewBox="0 0 240 120"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M0 96c20-10 40-10 60 0s40 10 60 0 40-10 60 0 40 10 60 0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M0 110c20-10 40-10 60 0s40 10 60 0 40-10 60 0 40 10 60 0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M186 70c0-18-14-32-32-32M186 70c0-18 14-32 32-32M186 70c8-14 24-20 40-16M186 70c-8-14-24-20-40-16M186 70v34"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </section>
  );
}
