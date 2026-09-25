import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './Footer.css';

const messages = [
  "Leva o lixo contigo.",
  "A praia agradece o teu cuidado.",
  "O mar não é caixote do lixo.",
  "Protege a areia, respeita o planeta.",
  "Cada beata no chão, um peixe em risco.",
  "Recolhe o que trouxeste.",
  "Mantém a praia limpa, todos os dias.",
  "Sol, mar e consciência ambiental.",
  "Natureza não é cinzeiro.",
  "Plástico na areia? Não aqui!",
  "Traz memórias, não lixo.",
  "Usa o cinzeiro, salva o oceano.",
  "Praia limpa, planeta feliz.",
  "O teu gesto faz a diferença.",
  "Sustentabilidade é ação, não intenção.",
  "Ama a praia como ela te ama.",
  "Um passo de cada vez para salvar o mar.",
  "Proteger a praia é proteger o futuro.",
  "A tua pegada pode ser verde.",
  "Desfruta com respeito.",
  "O futuro começa na areia.",
  "Cada gesto conta.",
  "Diz não ao lixo marinho.",
  "As ondas não limpam o que deixas.",
  "Sê o exemplo que o planeta precisa.",
  "Mantém a praia como gostas de a encontrar.",
  "O planeta começa aqui.",
  "Cuida da praia como cuidas da tua casa.",
  "Mar limpo, vida saudável.",
  "Faz parte da solução, não da poluição.",
  "Não deixes rastos, deixa boas memórias.",
  "Reutiliza. Reduz. Recicla.",
  "Preserva o azul com ações verdes.",
  "Sem lixo, mais vida marinha.",
  "Solta a toalha, não o plástico.",
  "Beatas na areia? Nunca.",
  "As praias limpas são responsabilidade de todos.",
  "Junta-te à maré da mudança.",
  "O respeito pelo ambiente começa contigo.",
  "Uma praia limpa é uma praia viva.",
  "Guarda o lixo até encontrares um caixote.",
  "Cuidar da praia é cuidar de nós.",
  "As pequenas ações constroem um grande futuro.",
  "A mudança começa contigo.",
  "Vive o verão de forma consciente.",
  "O oceano não quer lembranças de plástico.",
  "Cada beata recolhida é uma vitória.",
  "Não há planeta B.",
  "A tua atitude inspira os outros.",
  "Praia limpa, alma leve.",
  "Nunca nades sozinho. O mar é imprevisível.",
  "Respeita as bandeiras na praia, elas salvam vidas.",
  "Correntes fortes? Nada paralelo à costa.",
  "Vigia sempre as crianças junto à água.",
  "Conhece os sinais de perigo antes de entrar no mar.",
  "Não mergulhes em águas desconhecidas.",
  "O nadador-salvador é teu aliado, respeita as indicações.",
  "Mar calmo nem sempre é mar seguro.",
  "Usa protetor solar de 2 em 2 horas.",
  "O sol é mais forte entre as 12h e as 16h. Protege-te.",
  "Chapéu, óculos e protetor: o trio essencial.",
  "Protege a pele das crianças com fator 50+.",
  "Mesmo com nuvens, os raios UV atuam. Usa proteção.",
  "Bebe água regularmente, mesmo sem sede.",
  "A desidratação começa antes de sentires sede.",
  "Leva sempre água fresca para a praia.",
  "Evita bebidas alcoólicas sob exposição solar intensa.",
  "Hidrata-te antes, durante e depois da praia.",
  "Respeita o espaço dos outros na praia.",
  "Mantém o volume da música baixo. A praia é de todos.",
  "Cuidado com os jogos de bola perto dos outros banhistas.",
  "Sê educado com quem partilha a praia contigo.",
  "Respeita as zonas de banho e as zonas desportivas.",
  "Prefere produtos solares amigos do oceano.",
  "Escolhe garrafas reutilizáveis em vez de plástico descartável.",
  "Leva sacos reutilizáveis para guardar o teu lixo.",
  "Apoia negócios locais que respeitam o ambiente.",
  "Uma praia sustentável começa em escolhas conscientes.",
  "Reduz o uso de plástico descartável na praia."
];

/**
 * Props:
 *  - minimal: esconde a linha de links legais, mostrando só a mensagem a
 *    rodar. Usado em /mapa, onde o rodapé é a única faixa de cromo por baixo
 *    do mapa — uma única linha deixa-lhe o ecrã quase todo.
 */
export default function Footer({ minimal = false }) {
  const [index, setIndex] = useState(0);
  const wrapperRef = useRef(null);

  // (em português) A cada 10 segundos muda para a próxima mensagem
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // (em português) Enquanto é barra fixa, o rodapé tapa o que estiver por
  // baixo dele: o conteúdo reserva `--footer-h` para lhe ficar acima (ver
  // index.css). Esse valor era um número escrito à mão por breakpoint e ficava
  // sempre a dever alguns pixels ao rodapé real — com o tipo de letra do
  // sistema aumentado, ou numa janela entre os 481px e os 768px, o rodapé
  // crescia e passava a tapar a base do mapa. Publica-se aqui a altura medida,
  // para que o que se reserva seja sempre o que o rodapé ocupa; os valores no
  // CSS ficam como recurso até esta primeira medição.
  //
  // Quando o rodapé sai do fluxo fixo (telemóvel fora de /mapa, onde fecha a
  // página) não há nada a reservar: a medida é retirada para o site não
  // descontar a altura de um rodapé que já não está por cima de nada.
  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return undefined;
    const root = document.documentElement;
    const publish = () => {
      if (getComputedStyle(el).position !== 'fixed') {
        root.style.removeProperty('--footer-h-real');
        return;
      }
      // Arredonda para cima: meio pixel a menos era meio pixel de mapa tapado.
      const { height } = el.getBoundingClientRect();
      root.style.setProperty('--footer-h-real', `${Math.ceil(height)}px`);
    };
    publish();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', publish);
      return () => {
        window.removeEventListener('resize', publish);
        root.style.removeProperty('--footer-h-real');
      };
    }

    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--footer-h-real');
    };
  }, [minimal]);

  return (
    <footer
      ref={wrapperRef}
      className={`footer-wrapper${minimal ? ' footer-wrapper--minimal' : ''}`}
    >
      <div className="footer-content">
        <div className="footer-message">
          <span className="footer-message-pill">
            <FiRefreshCw size={11} className="footer-icon" aria-hidden="true" />
            {messages[index]}
          </span>
        </div>
        {!minimal && (
          <nav className="footer-links" aria-label="Informação legal">
            <Link to="/privacy-policy" className="footer-link">Privacidade</Link>
            <span className="footer-link-divider" aria-hidden="true">•</span>
            <Link to="/terms-and-conditions" className="footer-link">Termos</Link>
            <span className="footer-link-divider" aria-hidden="true">•</span>
            <Link to="/legal-notice" className="footer-link">Aviso Legal</Link>
            <span className="footer-link-divider" aria-hidden="true">•</span>
            <Link to="/cookies-policy" className="footer-link">Cookies</Link>
            <span className="footer-link-divider" aria-hidden="true">•</span>
            <Link to="/eliminar-conta" className="footer-link">Eliminar conta</Link>
          </nav>
        )}
      </div>
    </footer>
  );
}

