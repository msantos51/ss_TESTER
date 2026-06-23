import React from 'react';
import BackHomeButton from '../components/BackHomeButton';
import './TermsScreen.css';
import './InfoPage.css';

export default function TermsScreen() {
  return (
    <div className="page-wrapper terms-page">
      <BackHomeButton />
      <h2>Termos e Condições</h2>

      <div className="terms-section">
        <h3 className="terms-section-title">1. Aceitação dos Termos</h3>
        <p className="terms-text">
          Ao criar uma conta e utilizar a aplicação Sunny Sales, o utilizador (vendedor) concorda com os presentes Termos e Condições. Caso não concorde, não deve utilizar a aplicação.
        </p>
      </div>

      <div className="terms-section">
        <h3 className="terms-section-title">2. Registo e Conta</h3>
        <p className="terms-text">
          O vendedor é responsável por fornecer informações verdadeiras, completas e atualizadas no momento do registo. A falsificação de dados poderá resultar no cancelamento da conta.
        </p>
      </div>

      <div className="terms-section">
        <h3 className="terms-section-title">3. Privacidade e Partilha de Localização</h3>
        <p className="terms-text">
          A aplicação recolhe e partilha a localização do vendedor apenas durante o período em que este estiver ativo. Esta localização é visível publicamente aos clientes para fins de identificação de vendedores disponíveis.
        </p>
      </div>

      <div className="terms-section">
        <h3 className="terms-section-title">4. Pagamentos e Subscrição</h3>
        <p className="terms-text">
          O pagamento da subscrição semanal é obrigatório para manter a conta ativa e visível no mapa. O não pagamento pode suspender temporariamente ou cancelar a conta até que a situação seja regularizada.
        </p>
      </div>

      <div className="terms-section">
        <h3 className="terms-section-title">5. Obrigações do Vendedor</h3>
        <p className="terms-text">
          O vendedor compromete-se a:
        </p>
        <ul className="terms-list">
          <li>Cumprir a legislação aplicável nas suas atividades comerciais</li>
          <li>Garantir a qualidade e segurança dos produtos vendidos</li>
          <li>Não utilizar a aplicação para fins ilegais ou fraudulentos</li>
          <li>Manter os dados de contacto atualizados e precisos</li>
        </ul>
      </div>

      <div className="terms-section">
        <h3 className="terms-section-title">6. Registro Simplificado</h3>
        <p className="terms-text">
          O registo como vendedor não requer apresentação de documentação de licença. O vendedor é responsável por garantir que a sua atividade comercial está em conformidade com a legislação aplicável na sua jurisdição.
        </p>
      </div>

      <div className="terms-section">
        <h3 className="terms-section-title">7. Suspensão e Cancelamento</h3>
        <p className="terms-text">
          A administração da Sunny Sales reserva-se o direito de suspender ou cancelar a conta de qualquer vendedor que viole estes termos, utilize a aplicação de forma abusiva ou prejudique outros utilizadores.
        </p>
      </div>

      <div className="terms-section">
        <h3 className="terms-section-title">8. Limitação de Responsabilidade</h3>
        <p className="terms-text">
          A Sunny Sales não se responsabiliza por quaisquer perdas, danos ou prejuízos resultantes de transações comerciais entre vendedores e clientes. A utilização da aplicação é feita sob responsabilidade do utilizador.
        </p>
      </div>

      <div className="terms-section">
        <h3 className="terms-section-title">9. Alterações aos Termos</h3>
        <p className="terms-text">
          Estes Termos e Condições podem ser atualizados periodicamente. Notificaremos os utilizadores através da aplicação em caso de alterações significativas.
        </p>
      </div>

      <div className="terms-section">
        <h3 className="terms-section-title">10. Contacto</h3>
        <p className="terms-text">
          Para qualquer dúvida ou questão relacionada com estes termos, o utilizador pode contactar a equipa de suporte através do email:{' '}
          <a href="mailto:suporte@sunnysales.com" className="info-link">
            suporte@sunnysales.com
          </a>
        </p>
      </div>
    </div>
  );
}
