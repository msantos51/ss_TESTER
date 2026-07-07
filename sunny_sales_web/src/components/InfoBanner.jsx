import React from 'react';

/**
 * Banner de fecho, partilhado pelas páginas de conteúdo.
 *
 * Props:
 *  - icon: componente de ícone (react-icons) mostrado à esquerda
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
    </section>
  );
}
