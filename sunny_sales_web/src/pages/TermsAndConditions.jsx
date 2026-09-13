import { FiFileText, FiClock, FiMapPin } from 'react-icons/fi';

export default function TermsAndConditions() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <section className="legal-hero">
          <span className="legal-hero-icon" aria-hidden="true"><FiFileText /></span>
          <h1>Termos e Condições</h1>
          <p className="legal-hero-lead">
            As regras que regem o acesso e a utilização da plataforma Sunny
            Sales.
          </p>
          <div className="legal-badges">
            <span className="legal-badge"><FiClock /> Última atualização: 25 de junho de 2026</span>
            <span className="legal-badge"><FiMapPin /> Lei portuguesa</span>
          </div>
        </section>

        <nav className="legal-toc" aria-label="Secções desta página">
          <span className="legal-toc-label">Nesta página</span>
          <a href="#aceitacao">1. Aceitação dos Termos</a>
          <a href="#descricao-servico">2. Descrição do Serviço</a>
          <a href="#elegibilidade">3. Elegibilidade</a>
          <a href="#conta-utilizador">4. Conta de Utilizador</a>
          <a href="#propriedade-intelectual">5. Propriedade Intelectual</a>
          <a href="#uso-aceitavel">6. Uso Aceitável</a>
          <a href="#pagamentos">7. Processamento de Pagamentos</a>
          <a href="#isencao-responsabilidade">8. Isenção de Responsabilidade</a>
          <a href="#limitacao-responsabilidade">9. Limitação de Responsabilidade</a>
          <a href="#indemnizacao">10. Indenização</a>
          <a href="#links-externos">11. Links Externos</a>
          <a href="#rescisao">12. Rescisão</a>
          <a href="#lei-aplicavel">13. Lei Aplicável e Jurisdição</a>
          <a href="#disputas">14. Disputas e Resolução de Conflitos</a>
          <a href="#modificacoes">15. Modificações aos Termos</a>
          <a href="#integridade-contrato">16. Integridade do Contrato</a>
          <a href="#contacto">17. Contacto</a>
        </nav>

        <section id="aceitacao">
          <h2>1. Aceitação dos Termos</h2>
          <p>
            Ao aceder e utilizar a plataforma Sunny Sales, concorda em estar vinculado
            por estes Termos e Condições. Se não concorda com qualquer parte destes
            termos, por favor não utilize a nossa plataforma.
          </p>
        </section>

        <section id="descricao-servico">
          <h2>2. Descrição do Serviço</h2>
          <p>
            A Sunny Sales é uma plataforma que permite vendedores autónomos (vendedores
            de praia) gerir as suas atividades, rotas, horários e transações. Os
            serviços incluem mapeamento de rotas, gestão de conta, processamento de
            pagamentos e análise de dados.
          </p>
        </section>

        <section id="elegibilidade">
          <h2>3. Elegibilidade</h2>
          <p>
            Deve ter pelo menos 18 anos de idade e ser legalmente capaz de celebrar
            contratos vinculativos. Ao registar-se, declara que é elegível para
            utilizar os nossos serviços.
          </p>
        </section>

        <section id="conta-utilizador">
          <h2>4. Conta de Utilizador</h2>
          <h3>4.1 Registo</h3>
          <p>
            Para aceder aos serviços, deve registar-se e fornecer informações precisas
            e completas. É responsável pela manutenção da confidencialidade da sua
            senha e pela segurança da sua conta.
          </p>

          <h3>4.2 Responsabilidade da Conta</h3>
          <p>
            É inteira responsabilidade sua todas as atividades que ocorrem sob a sua
            conta. Concorda em notificar-nos imediatamente de qualquer uso não
            autorizado.
          </p>

          <h3>4.3 Encerramento da Conta</h3>
          <p>
            Podemos encerrar ou suspender a sua conta a qualquer momento, a nosso
            critério exclusivo, se violarmos estes Termos ou lei aplicável.
          </p>
        </section>

        <section id="propriedade-intelectual">
          <h2>5. Direitos de Propriedade Intelectual</h2>
          <p>
            Todos os conteúdos, funcionalidades e funcionalidade da plataforma Sunny
            Sales, incluindo mas não limitado a texto, gráficos, logos, imagens, áudio
            e software, são propriedade exclusiva da Sunny Sales ou dos seus fornecedores.
          </p>
          <p>
            Não pode reproduzir, distribuir, transmitir, modificar ou criar obras
            derivadas do conteúdo sem consentimento prévio por escrito.
          </p>
        </section>

        <section id="uso-aceitavel">
          <h2>6. Uso Aceitável</h2>
          <p>
            Concorda em não utilizar a plataforma para:
          </p>
          <ul>
            <li>Atividades ilegais ou que violem direitos de terceiros</li>
            <li>Fraude, assédio, difamação ou qualquer atividade prejudicial</li>
            <li>
              Transmissão de vírus, malware ou qualquer código prejudicial
            </li>
            <li>Tentativas de interferir com o funcionamento da plataforma</li>
            <li>
              Recolha não autorizada de dados pessoais de outros utilizadores
            </li>
            <li>Qualquer forma de discriminação ou discurso de ódio</li>
          </ul>
        </section>

        <section id="pagamentos">
          <h2>7. Processamento de Pagamentos</h2>
          <h3>7.1 Tarifas e Pagamentos</h3>
          <p>
            Os pagamentos são processados através de fornecedores terceirizados
            seguros. As tarifas e termos de pagamento serão apresentados antes da
            confirmação da transação.
          </p>

          <h3>7.2 Reembolsos</h3>
          <p>
            Os reembolsos são processados de acordo com a nossa política de reembolsos.
            Contacte-nos para solicitar um reembolso dentro de 30 dias da transação.
          </p>

          <h3>7.3 Responsabilidade de Pagamento</h3>
          <p>
            É responsável por todas as tarifas, impostos e custos associados ao
            processamento de pagamentos. Concorda em pagar todas as cobranças
            incorridas na sua conta.
          </p>
        </section>

        <section id="isencao-responsabilidade">
          <h2>8. Isenção de Responsabilidade</h2>
          <p>
            A plataforma Sunny Sales é fornecida "tal como está" e "conforme
            disponível", sem garantias de qualquer tipo, express ou implícitas.
          </p>
          <p>
            Não garantimos que:
          </p>
          <ul>
            <li>
              A plataforma será livre de erros, interrupções ou defeitos
            </li>
            <li>Quaisquer informações serão precisas ou completas</li>
            <li>
              Os resultados que obtém serão úteis para qualquer propósito específico
            </li>
          </ul>
          <p>
            Na máxima medida permitida por lei, não somos responsáveis por:
          </p>
          <ul>
            <li>Perda de dados ou rendimento</li>
            <li>Danos indiretos, incidentais ou consequentes</li>
            <li>Qualquer alegação de terceiros</li>
            <li>Interrupção de serviço</li>
          </ul>
        </section>

        <section id="limitacao-responsabilidade">
          <h2>9. Limitação de Responsabilidade</h2>
          <p>
            Em nenhuma circunstância a responsabilidade total da Sunny Sales
            excederá o valor que pagou pelos serviços nos últimos 12 meses.
          </p>
        </section>

        <section id="indemnizacao">
          <h2>10. Indenização</h2>
          <p>
            Concorda em indemnizar, defender e compensar a Sunny Sales, seus
            diretores, funcionários e agentes contra qualquer reivindicação,
            responsabilidade, dano, perda ou despesa (incluindo honorários de
            advogados) decorrentes da sua utilização da plataforma.
          </p>
        </section>

        <section id="links-externos">
          <h2>11. Links Externos</h2>
          <p>
            A nossa plataforma pode conter links para websites de terceiros. Não
            somos responsáveis pelo conteúdo, precisão ou práticas de privacidade
            desses sites. A sua utilização desses sites é por sua conta e risco.
          </p>
        </section>

        <section id="rescisao">
          <h2>12. Rescisão</h2>
          <p>
            Podemos rescindir ou suspender o acesso à sua conta e aos serviços
            imediatamente, sem notificação prévia, se:
          </p>
          <ul>
            <li>Violar estes Termos ou lei aplicável</li>
            <li>Envolver-se em atividades fraudulentas ou prejudiciais</li>
            <li>Não pagar as taxas owed</li>
            <li>Por qualquer razão, a nosso critério exclusivo</li>
          </ul>
        </section>

        <section id="lei-aplicavel">
          <h2>13. Lei Aplicável e Jurisdição</h2>
          <p>
            Estes Termos e Condições são regidos pelas leis de Portugal, sem
            consideração aos seus conflitos de disposições legais. Qualquer ação ou
            procedimento relacionado com estes Termos será submetido exclusivamente
            aos tribunais competentes em Portugal.
          </p>
        </section>

        <section id="disputas">
          <h2>14. Disputas e Resolução de Conflitos</h2>
          <p>
            Antes de iniciar qualquer ação legal, os utilizadores e a Sunny Sales
            concordam em tentar resolver disputas através de negociação amigável.
            Se a negociação falhar, as partes concordam em submeter à mediação.
          </p>
        </section>

        <section id="modificacoes">
          <h2>15. Modificações aos Termos</h2>
          <p>
            Reservamo-nos o direito de modificar estes Termos a qualquer momento. As
            alterações serão efectivas imediatamente após publicação. O seu uso
            continuado indica aceitação das alterações.
          </p>
        </section>

        <section id="integridade-contrato">
          <h2>16. Integridade do Contrato</h2>
          <p>
            Estes Termos, juntamente com a Política de Privacidade e Política de
            Cookies, constituem o acordo integral entre si e a Sunny Sales.
          </p>
        </section>

        <section id="contacto">
          <h2>17. Contacto</h2>
          <p>
            Se tiver perguntas sobre estes Termos e Condições, contacte-nos:
          </p>
          <p>
            <strong>Sunny Sales</strong>
            <br />
            Email: sunnysales.geral@gmail.com
          </p>
        </section>
      </div>
    </div>
  );
}
