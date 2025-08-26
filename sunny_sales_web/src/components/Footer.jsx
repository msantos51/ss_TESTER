import { useState, useEffect } from 'react';
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
  "Praia limpa, alma leve."
];

export default function Footer() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer
      className="footer-wrapper"
    >
      <div className="footer-message">{messages[index]}</div>
    </footer>
  );
}

