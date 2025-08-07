import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SobreProjeto() {
  const navigate = useNavigate();
  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.back}>Voltar</button>
      <h2 style={styles.title}>Sobre o Projeto</h2>
      <p style={styles.text}>
        <strong>Sunny Sales</strong> é uma plataforma que conecta vendedores
        ambulantes de produtos tradicionais de praia, como bolas de Berlim,
        gelados e acessórios, a banhistas por meio de um mapa interativo em
        tempo real.
      </p>
      <h3 style={styles.sectionTitle}>Motivação</h3>
      <p style={styles.text}>
        Consumidores frequentemente enfrentam dificuldade para localizar
        vendedores na praia. O Sunny Sales apresenta num mapa os vendedores
        mais próximos, os produtos disponíveis e as avaliações de outros
        clientes.
      </p>
      <h3 style={styles.sectionTitle}>Principais benefícios</h3>
      <ul style={styles.list}>
        <li>Elimina a necessidade de procurar vendedores pela praia.</li>
        <li>Reduz o tempo e o esforço dos vendedores ao direcioná-los para o público interessado.</li>
        <li>Contribui para a organização e a sustentabilidade das zonas balneares.</li>
      </ul>
      <p style={styles.text}>
        O Sunny Sales integra tradição e tecnologia para promover praticidade,
        sustentabilidade e valorização do comércio local.
      </p>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: 800,
    margin: '0 auto',
    backgroundColor: '#fdc500',
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
    color: '#000',
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
