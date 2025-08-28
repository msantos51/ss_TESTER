import React from 'react';
import BackHomeButton from '../components/BackHomeButton';

export default function SobreProjeto() {
  return (
    <div style={styles.container}>
      <BackHomeButton />
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
      backgroundColor: 'var(--bg-color)',
    borderRadius: '8px',
    fontFamily: 'sans-serif',
    color: '#333',
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
