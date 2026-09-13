import { MdCookie } from 'react-icons/md';
import { FiClock, FiSlash } from 'react-icons/fi';

export default function CookiesPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <section className="legal-hero">
          <span className="legal-hero-icon" aria-hidden="true"><MdCookie /></span>
          <h1>Política de Cookies</h1>
          <p className="legal-hero-lead">
            O que guardamos no teu navegador para o mapa funcionar — e o que
            não guardamos.
          </p>
          <div className="legal-badges">
            <span className="legal-badge"><FiClock /> Última atualização: 22 de julho de 2026</span>
            <span className="legal-badge"><FiSlash /> Sem cookies de terceiros</span>
          </div>
        </section>

        <nav className="legal-toc" aria-label="Secções desta página">
          <span className="legal-toc-label">Nesta página</span>
          <a href="#o-que-sao">1. O que são Cookies?</a>
          <a href="#o-que-utilizamos">2. O que a Sunny Sales Utiliza</a>
          <a href="#o-que-nao-utilizamos">3. O que Não Utiliza</a>
          <a href="#terceiros-pagamentos">4. Cookies de Terceiros</a>
          <a href="#localizacao">5. Localização</a>
          <a href="#gerir-eliminar">6. Como Gerir e Eliminar</a>
          <a href="#contacto">7. Contacto</a>
          <a href="#alteracoes">8. Alterações a Esta Política</a>
        </nav>

        <section id="o-que-sao">
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

        <section id="o-que-utilizamos">
          <h2>2. O que a Sunny Sales Utiliza</h2>
          <p>
            Este site é dedicado ao banhista e não tem contas nem início de sessão,
            pelo que não guardamos quaisquer dados de autenticação no seu navegador.
            Aquilo que guardamos no seu dispositivo é
            <strong> estritamente necessário</strong> ao funcionamento do mapa:
          </p>
          <ul>
            <li>
              <strong>Última posição do mapa:</strong> guardamos no armazenamento de
              sessão do navegador as coordenadas onde consultou o mapa pela última
              vez, para o abrir na sua praia em vez do centro do país. É apagada
              quando fecha o separador.
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

        <section id="o-que-nao-utilizamos">
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

        <section id="terceiros-pagamentos">
          <h2>4. Cookies de Terceiros (Pagamentos)</h2>
          <p>
            Este site não processa pagamentos: a compra é feita diretamente ao
            vendedor, na praia, pelos meios que ele disponibilizar. Não são
            colocados no seu navegador cookies de processadores de pagamento.
          </p>
        </section>

        <section id="localizacao">
          <h2>5. Localização</h2>
          <p>
            As funcionalidades de mapa podem pedir acesso à sua localização. Esse
            acesso é solicitado diretamente pelo navegador e só é ativado com a sua
            permissão; a localização é usada para mostrar vendedores próximos e não é
            guardada em cookies de publicidade.
          </p>
        </section>

        <section id="gerir-eliminar">
          <h2>6. Como Gerir e Eliminar</h2>
          <p>
            Pode limpar o armazenamento local e os cookies a qualquer momento nas
            definições do seu navegador (secção de privacidade/dados de sites). Como
            não guardamos dados de conta, não perde qualquer acesso ao fazê-lo.
          </p>
          <ul>
            <li><strong>Chrome:</strong> Definições → Privacidade e segurança → Cookies e dados de sites</li>
            <li><strong>Firefox:</strong> Definições → Privacidade e segurança → Cookies e dados de sites</li>
            <li><strong>Safari:</strong> Preferências → Privacidade → Gerir dados de sites</li>
            <li><strong>Edge:</strong> Definições → Privacidade → Cookies e dados de sites</li>
          </ul>
        </section>

        <section id="contacto">
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

        <section id="alteracoes">
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
