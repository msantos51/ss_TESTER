import { useState, useEffect } from 'react';
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

export default function Footer() {
  const [index, setIndex] = useState(0);

  // (em português) A cada 10 segundos muda para a próxima mensagem
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="footer-wrapper">
      <div className="footer-content">
        <div className="footer-message">
          <FiRefreshCw size={11} className="footer-icon" />
          {messages[index]}
        </div>
        <div className="footer-links">
          <Link to="/privacy-policy" className="footer-link">Privacidade</Link>
          <span className="footer-link-divider">•</span>
          <Link to="/terms-and-conditions" className="footer-link">Termos</Link>
          <span className="footer-link-divider">•</span>
          <Link to="/legal-notice" className="footer-link">Aviso Legal</Link>
          <span className="footer-link-divider">•</span>
          <Link to="/cookies-policy" className="footer-link">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}

