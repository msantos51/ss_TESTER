import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// (em português) Meta tags por rota (title + description + Open Graph).
//
// Nota SEO: com HashRouter os crawlers veem sempre o mesmo URL base, pelo
// que estas tags melhoram sobretudo o título do separador, o histórico, os
// favoritos e as partilhas feitas a partir do browser (os scrapers que
// executam JS, como o do Google, leem os valores atualizados). A migração
// para BrowserRouter (o backend já faz fallback para index.html) daria a
// cada página um URL real — ver DESIGN_SYSTEM.md/relatório.
const BASE_TITLE = 'Sunny Sales';

const META = {
  '/': {
    title: 'Sunny Sales — Vendedores de praia em tempo real',
    description:
      'Encontra vendedores ambulantes na praia em tempo real. Bolas de Berlim, gelados e acessórios de praia perto de ti.',
  },
  '/sobre-projeto': {
    title: 'Sobre o Projeto · Sunny Sales',
    description:
      'Conhece o Sunny Sales: a plataforma que liga vendedores ambulantes de praia a banhistas através de um mapa em tempo real.',
  },
  '/sustentabilidade': {
    title: 'Praia Sustentável · Sunny Sales',
    description:
      'Boas práticas para praias mais limpas: menos plástico, menos beatas e um comércio de praia mais consciente.',
  },
  '/planos': {
    title: 'Planos para Vendedores · Sunny Sales',
    description:
      'Planos semanal, quinzenal e mensal para vendedores de praia. Ativação imediata, sem taxas escondidas, cancela quando quiseres.',
  },
  '/como-funciona': {
    title: 'Como Funciona · Sunny Sales',
    description:
      'Regista-te como vendedor, ativa a localização e aparece no mapa para os banhistas mais próximos. Vê como funciona passo a passo.',
  },
  '/faqs': {
    title: 'Perguntas Frequentes · Sunny Sales',
    description:
      'Respostas às perguntas mais comuns de banhistas e vendedores sobre o Sunny Sales.',
  },
  '/contacto': {
    title: 'Contacto · Sunny Sales',
    description:
      'Fala connosco: dúvidas, sugestões ou parcerias. Respondemos em 24–48 horas úteis.',
  },
  '/map': {
    title: 'Mapa de Vendedores · Sunny Sales',
    description:
      'Vê em tempo real os vendedores de praia perto de ti e filtra por produto e distância.',
  },
  '/dashboard': {
    title: 'Painel do Vendedor · Sunny Sales',
    description: 'Gere a tua presença no mapa e acompanha a tua atividade.',
  },
  '/privacy-policy': {
    title: 'Política de Privacidade · Sunny Sales',
    description: 'Como o Sunny Sales recolhe, usa e protege os teus dados pessoais.',
  },
  '/terms-and-conditions': {
    title: 'Termos e Condições · Sunny Sales',
    description: 'Termos e condições de utilização da plataforma Sunny Sales.',
  },
  '/legal-notice': {
    title: 'Aviso Legal · Sunny Sales',
    description: 'Informação legal sobre a plataforma Sunny Sales.',
  },
  '/cookies-policy': {
    title: 'Política de Cookies · Sunny Sales',
    description: 'Como o Sunny Sales utiliza cookies e tecnologias semelhantes.',
  },
};

function setMeta(selector, attr, value) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

export default function PageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = META[pathname];
    const title = meta?.title || BASE_TITLE;
    const description = meta?.description || META['/'].description;

    document.title = title;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
  }, [pathname]);

  return null;
}
