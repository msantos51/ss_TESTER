import { useEffect } from 'react';

/**
 * Revelação ao rolar (scroll reveal).
 *
 * Observa todos os elementos com a classe `.reveal` — incluindo os que
 * aparecem mais tarde (páginas carregadas sob demanda via Suspense) através
 * de um MutationObserver — e adiciona-lhes `.in` quando entram no ecrã.
 *
 * Cada elemento só é escondido (`.reveal-init`) no momento em que passa a ser
 * observado, por isso, se não houver JavaScript ou IntersectionObserver, o
 * conteúdo permanece sempre visível. Respeita `prefers-reduced-motion`.
 */
export default function useScrollReveal() {
  useEffect(() => {
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const hasIO = 'IntersectionObserver' in window;

    const show = (el) => el.classList.add('in');

    const io =
      hasIO && !reduce
        ? new IntersectionObserver(
            (entries, obs) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  show(entry.target);
                  obs.unobserve(entry.target);
                }
              });
            },
            { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
          )
        : null;

    const scan = () => {
      document
        .querySelectorAll('.reveal:not(.reveal-init)')
        .forEach((el) => {
          el.classList.add('reveal-init');
          if (io) {
            io.observe(el);
          } else {
            // Sem IntersectionObserver ou com movimento reduzido: mostra já.
            show(el);
          }
        });
    };

    scan();

    // Coalesce rajadas de mutações (ex.: atualizações de marcadores no mapa)
    // numa única verificação por frame para não pesar no desempenho.
    let scheduled = false;
    const scheduleScan = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        scan();
      });
    };

    const mo = new MutationObserver(scheduleScan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      if (io) io.disconnect();
    };
  }, []);
}
