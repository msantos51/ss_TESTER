// (em português) Página Web com os Termos e Condições da aplicação Sunny Sales

import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TermsScreen() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.back}>⬅ Voltar</button>
      <h2 style={styles.title}>Termos e Condições</h2>

      <h3 style={styles.sectionTitle}>1. Aceitação dos Termos</h3>
      <p style={styles.text}>
        Ao criar uma conta e utilizar a aplicação Sunny Sales, o utilizador (vendedor) concorda com os presentes Termos e Condições. Caso não concorde, não deve utilizar a aplicação.
      </p>

      <h3 style={styles.sectionTitle}>2. Registo e Conta</h3>
      <p style={styles.text}>
        O vendedor é responsável por fornecer informações verdadeiras, completas e atualizadas no momento do registo. A falsificação de dados poderá resultar no cancelamento da conta.
      </p>

      <h3 style={styles.sectionTitle}>3. Privacidade e Partilha de Localização</h3>
      <p style={styles.text}>
        A aplicação recolhe e partilha a localização do vendedor apenas durante o período em que este estiver ativo. Esta localização é visível publicamente aos clientes para fins de identificação de vendedores disponíveis.
      </p>

      <h3 style={styles.sectionTitle}>4. Pagamentos e Subscrição</h3>
      <p style={styles.text}>
        O pagamento da subscrição semanal é obrigatório para manter a conta ativa e visível no mapa. O não pagamento pode suspender temporariamente ou cancelar a conta até que a situação seja regularizada.
      </p>

      <h3 style={styles.sectionTitle}>5. Obrigações do Vendedor</h3>
      <p style={styles.text}>
        O vendedor compromete-se a:<br />
        • Cumprir a legislação aplicável nas suas atividades comerciais;<br />
        • Garantir a qualidade e segurança dos produtos vendidos;<br />
        • Não utilizar a aplicação para fins ilegais ou fraudulentos.
      </p>

      <h3 style={styles.sectionTitle}>6. Suspensão e Cancelamento</h3>
      <p style={styles.text}>
        A administração da Sunny Sales reserva-se o direito de suspender ou cancelar a conta de qualquer vendedor que viole estes termos, utilize a aplicação de forma abusiva ou prejudique outros utilizadores.
      </p>

      <h3 style={styles.sectionTitle}>7. Limitação de Responsabilidade</h3>
      <p style={styles.text}>
        A Sunny Sales não se responsabiliza por quaisquer perdas, danos ou prejuízos resultantes de transações comerciais entre vendedores e clientes. A utilização da aplicação é feita sob responsabilidade do utilizador.
      </p>

      <h3 style={styles.sectionTitle}>8. Alterações aos Termos</h3>
      <p style={styles.text}>
        Estes Termos e Condições podem ser atualizados periodicamente. Notificaremos os utilizadores através da aplicação em caso de alterações significativas.
      </p>

      <h3 style={styles.sectionTitle}>9. Contacto</h3>
      <p style={styles.text}>
        Para qualquer dúvida ou questão relacionada com estes termos, o utilizador pode contactar a equipa de suporte através do email: suporte@sunnysales.com
      </p>
    </div>
  );
}

// estilos CSS inline
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
    color: '#0077cc',
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
};
