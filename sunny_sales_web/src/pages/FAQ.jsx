import './InfoPage.css';
import './FAQ.css';

// (em português) O site é dedicado ao banhista: estas são as únicas perguntas
// frequentes apresentadas.
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
    a: 'Não. O Sunny Sales não tem contas nem início de sessão: qualquer banhista pode consultar o mapa livremente.',
  },
  {
    q: 'Como pago aos vendedores?',
    a: 'O pagamento é feito diretamente ao vendedor no momento da compra, com os métodos de pagamento que ele tiver disponíveis (MB Way, numerário ou cartão).',
  },
  {
    q: 'A localização dos vendedores é em tempo real?',
    a: 'Sim. A posição de cada vendedor é atualizada automaticamente enquanto este estiver ativo na aplicação.',
  },
  {
    q: 'O site guarda a minha localização?',
    a: 'Não. A tua localização é usada apenas no teu dispositivo para centrar o mapa e calcular distâncias; não é enviada nem guardada nos nossos servidores.',
  },
  {
    q: 'Como posso ajudar a manter a praia limpa?',
    a: 'Visita a página Praia Sustentável para veres os gestos simples que fazem a diferença: cinzeiros portáteis, garrafas reutilizáveis e levar sempre o lixo contigo.',
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
  return (
    <div className="info-page faq-page">

      <div className="info-hero">
        <h1 className="info-hero-title">
          Perguntas Frequentes
        </h1>
        <p className="info-hero-lead">
          Encontra respostas às perguntas mais comuns dos banhistas sobre o Sunny Sales.
        </p>
      </div>

      <FaqGroup items={FAQS_BANHISTAS} />
    </div>
  );
}
