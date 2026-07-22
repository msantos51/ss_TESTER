export default function CookiesPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>Política de Cookies</h1>
          <p className="last-updated">Última atualização: 22 de julho de 2026</p>
        </div>

        <section>
          <h2>1. O que são Cookies e Armazenamento Local?</h2>
          <p>
            Cookies são pequenos ficheiros de texto guardados no seu dispositivo
            quando visita um website. Tecnologias semelhantes, como o
            <strong> armazenamento local (localStorage)</strong> e o
            <strong> armazenamento de sessão (sessionStorage)</strong> do navegador,
            permitem guardar informação no próprio dispositivo. Esta política explica
            de forma transparente o que a Sunny Sales utiliza — e o que não utiliza.
          </p>
        </section>

        <section>
          <h2>2. O que a Sunny Sales Utiliza</h2>
          <p>
            A plataforma foi construída para recolher o mínimo indispensável. Aquilo
            que guardamos no seu dispositivo é <strong>estritamente necessário</strong>
            ao funcionamento do serviço:
          </p>
          <ul>
            <li>
              <strong>Autenticação (vendedores):</strong> guardamos no armazenamento
              local do navegador o token de sessão e os dados básicos da conta, para
              o manter com sessão iniciada. Sem isto, não seria possível aceder ao
              painel do vendedor.
            </li>
            <li>
              <strong>Preferências da interface:</strong> pequenas marcas para
              recordar, por exemplo, que já viu o cartão de boas-vindas ou a dica de
              localização, para não as repetir.
            </li>
          </ul>
          <p>
            Por serem estritamente necessários, estes elementos não exigem
            consentimento prévio ao abrigo do RGPD e da legislação aplicável.
          </p>
        </section>

        <section>
          <h2>3. O que a Sunny Sales NÃO Utiliza (atualmente)</h2>
          <p>
            Para sermos claros, e ao contrário de muitos sites, a Sunny Sales
            <strong> não utiliza atualmente</strong>:
          </p>
          <ul>
            <li>Cookies de análise de audiência (ex.: Google Analytics);</li>
            <li>Cookies ou pixels de publicidade e marketing (ex.: Facebook Pixel);</li>
            <li>Rastreamento de comportamento entre sites;</li>
            <li>Venda ou partilha de dados de navegação para fins publicitários.</li>
          </ul>
          <p>
            Se, no futuro, viermos a adotar ferramentas de análise ou marketing, esta
            política será atualizada e passará a ser pedido o seu consentimento antes
            de ativar quaisquer cookies não essenciais.
          </p>
        </section>

        <section>
          <h2>4. Cookies de Terceiros (Pagamentos)</h2>
          <p>
            Quando efetua um pagamento, o processo decorre nas páginas seguras do
            <strong> Stripe</strong>, o nosso processador de pagamentos. O Stripe pode
            colocar os seus próprios cookies para prevenção de fraude e segurança da
            transação, geridos segundo a política de privacidade do Stripe
            (stripe.com/privacy). A Sunny Sales não tem acesso aos dados do seu cartão.
          </p>
        </section>

        <section>
          <h2>5. Localização</h2>
          <p>
            As funcionalidades de mapa podem pedir acesso à sua localização. Esse
            acesso é solicitado diretamente pelo navegador e só é ativado com a sua
            permissão; a localização é usada para mostrar vendedores próximos e não é
            guardada em cookies de publicidade.
          </p>
        </section>

        <section>
          <h2>6. Como Gerir e Eliminar</h2>
          <p>
            Pode limpar o armazenamento local e os cookies a qualquer momento nas
            definições do seu navegador (secção de privacidade/dados de sites). Ao
            fazê-lo, a sua sessão de vendedor terminará e terá de iniciar sessão
            novamente.
          </p>
          <ul>
            <li><strong>Chrome:</strong> Definições → Privacidade e segurança → Cookies e dados de sites</li>
            <li><strong>Firefox:</strong> Definições → Privacidade e segurança → Cookies e dados de sites</li>
            <li><strong>Safari:</strong> Preferências → Privacidade → Gerir dados de sites</li>
            <li><strong>Edge:</strong> Definições → Privacidade → Cookies e dados de sites</li>
          </ul>
        </section>

        <section>
          <h2>7. Contacto</h2>
          <p>
            Para qualquer questão sobre esta Política de Cookies, contacte-nos:
          </p>
          <p>
            <strong>Sunny Sales</strong>
            <br />
            Email: sunnysales.geral@gmail.com
          </p>
        </section>

        <section>
          <h2>8. Alterações a Esta Política</h2>
          <p>
            Podemos atualizar esta Política de Cookies periodicamente. A data de
            última atualização está indicada no topo desta página.
          </p>
        </section>
      </div>
    </div>
  );
}
