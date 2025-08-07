import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Sustentabilidade() {
  const navigate = useNavigate();
  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.back}>Voltar</button>
      <h2 style={styles.title}>Sustentabilidade</h2>
      <p style={styles.text}>
        Acreditamos que o futuro do comércio de praia deve ser mais
        <strong>eficiente, consciente e ecológico</strong>. O Sunny Sales assume o
        compromisso de promover a sustentabilidade ambiental e social nas zonas
        balneares.
      </p>
      <h3 style={styles.sectionTitle}>Iniciativas implementadas</h3>
      <p style={styles.text}><strong>Redução da pegada ecológica</strong><br />
        A plataforma ajuda os vendedores a evitar deslocações desnecessárias,
        reduzindo o esforço físico e o impacto ambiental.
      </p>
      <p style={styles.text}><strong>Promoção de embalagens sustentáveis</strong><br />
        Incentivamos a utilização de sacos biodegradáveis, embalagens reutilizáveis
        e materiais amigos do ambiente.
      </p>
      <p style={styles.text}><strong>Consciencialização dos banhistas</strong></p>
      <ul style={styles.list}>
        <li>Recolher o lixo após a permanência na praia.</li>
        <li>Utilizar cinzeiros portáteis.</li>
        <li>Preferir protetor solar com menor impacto ambiental.</li>
      </ul>
      <p style={styles.text}><strong>Apoio a campanhas ambientais</strong><br />
        Divulgamos e colaboramos com iniciativas de limpeza de praias,
        sensibilização ambiental e educação para a sustentabilidade.
      </p>
      <p style={styles.text}>
        O objetivo é promover praias mais limpas, vendedores mais responsáveis
        e um verão sustentável.
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
