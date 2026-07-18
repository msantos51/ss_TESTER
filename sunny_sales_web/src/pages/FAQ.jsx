import { useState } from 'react';
import { FiUsers, FiShoppingBag } from 'react-icons/fi';
import './InfoPage.css';
import './FAQ.css';

const FAQS_BANHISTAS = [
  {
    q: 'Como encontro vendedores na praia?',
    a: 'Abre o mapa na página inicial e vê em tempo real a localização de todos os vendedores ativos perto de ti.',
  },
  {
    q: 'Posso filtrar por tipo de produto?',
    a: 'Sim. No mapa, clica no botão "Filtrar" para escolher os produtos que procuras e a distância máxima a que estão os vendedores.',
  },
  {
    q: 'Preciso de criar conta para usar o mapa?',
    a: 'Não. Qualquer banhista pode consultar o mapa e ver os vendedores sem precisar de criar conta.',
  },
  {
    q: 'Como pago aos vendedores?',
    a: 'O pagamento é feito diretamente ao vendedor no momento da compra, com os métodos de pagamento que ele tiver disponíveis (MB Way, numerário ou cartão).',
  },
  {
    q: 'A localização dos vendedores é em tempo real?',
    a: 'Sim. A posição de cada vendedor é atualizada automaticamente enquanto este estiver ativo na aplicação.',
  },
];

const FAQS_VENDEDORES = [
  {
    q: 'Como me torno vendedor na plataforma?',
    a: 'Cria uma conta de vendedor, preenche o teu perfil e escolhe um plano de subscrição para ficares visível no mapa.',
  },
  {
    q: 'Quais são os planos disponíveis?',
    a: 'Temos planos semanal, quinzenal e mensal. Podes consultar todos os detalhes e preços na página de Planos.',
  },
  {
    q: 'Posso cancelar a subscrição quando quiser?',
    a: 'Sim. Podes cancelar a qualquer momento e o teu acesso mantém-se ativo até ao fim do período já pago.',
  },
  {
    q: 'Como ativo a minha localização no mapa?',
    a: 'Após iniciares sessão, ativa a partilha de localização no teu painel de vendedor para apareceres automaticamente para os banhistas próximos.',
  },
  {
    q: 'Posso ver estatísticas sobre os meus clientes?',
    a: 'Sim. Todos os planos incluem acesso a estatísticas avançadas sobre a tua atividade e visibilidade na plataforma.',
  },
];

function FaqGroup({ items }) {
  return (
    <div className="faq-list">
      {items.map((faq) => (
        <details key={faq.q} className="faq-item reveal">
          <summary className="faq-q">{faq.q}</summary>
          <p className="faq-a">{faq.a}</p>
        </details>
      ))}
    </div>
  );
}

export default function FAQ() {
  const [tab, setTab] = useState('banhistas');

  return (
    <div className="info-page faq-page">

      <div className="info-hero">
        <h1 className="info-hero-title">
          Perguntas Frequentes
        </h1>
        <p className="info-hero-lead">
          Encontra respostas às perguntas mais comuns sobre o Sunny Sales, separadas para
          banhistas e para vendedores.
        </p>
      </div>

      <div className="faq-tabs" role="group" aria-label="Escolher grupo de perguntas">
        <button
          className={`faq-tab${tab === 'banhistas' ? ' active' : ''}`}
          onClick={() => setTab('banhistas')}
          aria-pressed={tab === 'banhistas'}
        >
          <FiUsers size={16} aria-hidden="true" />
          Banhistas
        </button>
        <button
          className={`faq-tab${tab === 'vendedores' ? ' active' : ''}`}
          onClick={() => setTab('vendedores')}
          aria-pressed={tab === 'vendedores'}
        >
          <FiShoppingBag size={16} aria-hidden="true" />
          Vendedores
        </button>
      </div>

      {tab === 'banhistas' ? (
        <FaqGroup items={FAQS_BANHISTAS} />
      ) : (
        <FaqGroup items={FAQS_VENDEDORES} />
      )}
    </div>
  );
}
