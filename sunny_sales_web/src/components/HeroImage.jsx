import React from 'react';

// (em português) Imagem hero das páginas internas.
// Gera um srcset responsivo a partir de uma fotografia do Unsplash — o
// parâmetro auto=format entrega WebP/AVIF aos browsers que os suportam.
// As heroes estão no topo da página (dentro do viewport inicial), por isso
// carregam com prioridade alta em vez de lazy loading — são normalmente o
// elemento LCP destas páginas. O contentor .info-hero-media já reserva a
// altura, pelo que não causam CLS.
const WIDTHS = [480, 768, 1000, 1400];
const PARAMS = 'auto=format&fit=crop&q=80';

export default function HeroImage({ src, alt }) {
  const base = src.split('?')[0];
  const srcSet = WIDTHS.map((w) => `${base}?${PARAMS}&w=${w} ${w}w`).join(', ');

  return (
    <img
      src={`${base}?${PARAMS}&w=1000`}
      srcSet={srcSet}
      sizes="(max-width: 780px) 100vw, 45vw"
      alt={alt}
      decoding="async"
      fetchPriority="high"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
}
