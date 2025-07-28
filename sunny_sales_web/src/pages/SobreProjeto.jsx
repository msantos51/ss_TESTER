import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SobreProjeto() {
  const navigate = useNavigate();
  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.back}>⬅ Voltar</button>
      <h2 style={styles.title}>Sobre o Projeto</h2>
      <p style={styles.text}>
        <strong>Sunny Sales</strong> é uma plataforma inovadora que liga vendedores
        ambulantes de produtos tradicionais de praia (como bolas de Berlim,
        gelados e acessórios) a banhistas, através de um mapa interactivo em
        tempo real.
      </p>
      <h3 style={styles.sectionTitle}>🏖️ Porquê criámos este projecto?</h3>
      <p style={styles.text}>
        Todos já passámos pela experiência de querer comprar algo na praia e não
        saber onde encontrar o vendedor. Com o Sunny Sales, os utilizadores podem
        visualizar num mapa os vendedores mais próximos, os produtos disponíveis e
        até avaliações deixadas por outros clientes.
      </p>
      <h3 style={styles.sectionTitle}>🎯 O que resolvemos:</h3>
      <ul style={styles.list}>
        <li>Os banhistas deixam de ter de esperar ou procurar os vendedores.</li>
        <li>Os vendedores poupam tempo e esforço, chegando directamente a quem os procura.</li>
        <li>As praias tornam-se mais organizadas e sustentáveis.</li>
      </ul>
      <p style={styles.text}>
        O Sunny Sales é uma ponte entre tradição e tecnologia, com foco na
        praticidade, sustentabilidade e valorização do comércio local.
      </p>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: 800,
    margin: '0 auto',
    backgroundColor: '#fff9e6',
    borderRadius: '8px',
    fontFamily: 'sans-serif',
    color: '#333',
  },
  back: {
    marginBottom: '1rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    color: '#19a0a4',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginTop: '1rem',
  },
  text: {
    fontSize: '1rem',
    textAlign: 'justify',
    marginBottom: '1rem',
  },
  list: {
    marginBottom: '1rem',
    marginLeft: '1.2rem',
  },
};
