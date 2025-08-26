import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ImplementarScreen() {
  const navigate = useNavigate();
  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.back}>Voltar</button>
      <h2 style={styles.title}>Implementação do Sunny Sales</h2>
      <p style={styles.text}>
        O Sunny Sales é uma solução tecnológica para o comércio ambulante de
        praia, indicada para <strong>autarquias, juntas de freguesia e entidades
        gestoras do litoral</strong> que pretendem modernizar a experiência
        balnear.
      </p>
      <h3 style={styles.sectionTitle}>Vantagens para a autarquia</h3>
      <ul style={styles.list}>
        <li>Organização da atividade ambulante.</li>
        <li>Promoção do comércio local e sustentável.</li>
        <li>Melhoria da experiência dos veraneantes.</li>
        <li>Redução da circulação desnecessária e do ruído.</li>
        <li>Reforço da imagem de inovação e modernização.</li>
      </ul>
      <h3 style={styles.sectionTitle}>Recursos disponibilizados</h3>
      <ul style={styles.list}>
        <li>Mapa digital com vendedores em tempo real.</li>
        <li>Filtros por tipo de produto.</li>
        <li>Acesso simplificado via QR Code.</li>
        <li>Página personalizada por localidade (opcional).</li>
        <li>Estatísticas de utilização mediante solicitação.</li>
      </ul>
      <h3 style={styles.sectionTitle}>Processo de implementação</h3>
      <ol style={styles.list}>
        <li>Envie um e-mail para <strong>[teu-email]</strong>.</li>
        <li>Agendaremos uma demonstração breve, presencial ou online.</li>
        <li>Em poucos dias, a praia pode ser integrada no sistema.</li>
      </ol>
      <p style={styles.text}>
        <strong>Estamos disponíveis para parcerias, protocolos institucionais e
        ações conjuntas.</strong>
      </p>
      <p style={styles.text}>
        Participe na transformação digital das praias portuguesas.
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
