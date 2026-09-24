import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Duração da interpolação entre duas leituras de GPS. Fixá-la em meio segundo
// dava um pin que andava meio segundo e parava até à leitura seguinte — o
// andamento aos empurrões que se nota na app. Aqui a duração acompanha o
// intervalo real entre leituras, dentro de limites sãos, para o pin deslizar
// sem interrupções à velocidade a que o vendedor anda mesmo. O teto é o
// intervalo do watch (1 s): acima disso o pin ficava para trás do vendedor.
const MIN_DURATION = 300;
const MAX_DURATION = 1000;
const DEFAULT_DURATION = 600;

// Desloca o mapa para o pin ficar no centro, com precisão abaixo do píxel: o
// `panBy` do Leaflet arredonda ao píxel e, a cada fotograma, isso tremia. É o
// mesmo deslocamento que o Leaflet usa ao arrastar o mapa com o dedo. O painel
// do mapa não roda (roda o painel dos tiles, lá dentro), por isso a conta é
// feita no referencial do painel do pin.
function centerOn(map, marker) {
  if (map._animatingZoom || map._panAnim?._inProgress) return;
  const layerPoint = map.latLngToLayerPoint(marker.getLatLng());
  const panePoint = map._rotate ? map.rotatedPointToMapPanePoint(layerPoint) : layerPoint;
  const offset = panePoint.add(map._getMapPanePos()).subtract(map.getSize().divideBy(2));
  if (Math.abs(offset.x) < 0.01 && Math.abs(offset.y) < 0.01) return;
  map._rawPanBy(offset);
  map.fire('move');
}

// Marcador do vendedor, desenhado à mão em vez de pelo <Marker> do
// react-leaflet. O motivo é a fluidez: o rumo muda dez vezes por segundo e o
// componente do react-leaflet responde a cada mudança de ícone trocando o
// elemento no DOM — o que corta a animação em curso, reinicia o halo a pulsar
// e devolve o pin à última posição entregue. Aqui o elemento é criado uma vez;
// a posição muda por interpolação e o rumo por variável CSS, sem tocar no DOM.
//
// Com `follow`, o mapa desliza com o pin no mesmo fotograma e o pin fica
// sempre no centro, como no site. Seguir por saltos (o mapa só andava quando o
// pin se afastava do centro) punha o pin e o mapa a mexer-se cada um ao seu
// ritmo, que era a falta de fluidez da app.
export default function AnimatedMarker({ position, icon, hasHeading, follow = false }) {
  const map = useMap();
  const markerRef = useRef(null);
  const followRef = useRef(follow);
  followRef.current = follow;
  // Posição mostrada neste instante (o fotograma a meio da interpolação), de
  // onde arranca a animação seguinte: partir da última leitura entregue faria
  // o pin saltar para trás sempre que uma nova chegasse a meio do caminho.
  const currentRef = useRef(position);
  const animFrameRef = useRef(null);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    const marker = L.marker(currentRef.current, {
      icon,
      interactive: false,
      keyboard: false,
      // O pin do próprio vendedor fica por cima dos tiles e de qualquer outro
      // marcador; é o que ele procura quando olha para o ecrã.
      zIndexOffset: 1000,
    });
    // O Leaflet arredonda a posição ao píxel antes de o leaflet-rotate a rodar.
    // Com o mapa a seguir a bússola isto corre a cada fotograma, e o erro do
    // arredondamento, rodado, punha o pin a tremer um píxel contra os tiles.
    marker.update = function update() {
      if (this._icon && this._map) this._setPos(this._map.latLngToLayerPoint(this._latlng));
      return this;
    };
    marker.addTo(map);
    markerRef.current = marker;
    return () => {
      marker.remove();
      markerRef.current = null;
    };
    // O ícone inicial entra na criação; as mudanças seguintes vão no efeito
    // abaixo, para o marcador não ser recriado a cada uma.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    if (markerRef.current) markerRef.current.setIcon(icon);
  }, [icon]);

  // Rumo: aqui só se diz se há ou não para onde apontar. O ângulo em si é
  // escrito a cada fotograma pelo MapRotationController, que é quem roda o
  // mapa — as duas coisas têm de sair do mesmo fotograma, senão a seta aponta
  // para um rumo e o mapa já está virado para outro.
  useEffect(() => {
    const el = markerRef.current?.getElement();
    if (!el) return;
    el.classList.toggle('has-heading', Boolean(hasHeading));
  }, [hasHeading, icon]);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) {
      currentRef.current = position;
      return undefined;
    }
    const from = currentRef.current;
    const to = position;
    if (from[0] === to[0] && from[1] === to[1]) return undefined;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const now0 = performance.now();
    const gap = lastUpdateRef.current ? now0 - lastUpdateRef.current : DEFAULT_DURATION;
    lastUpdateRef.current = now0;
    const duration = Math.min(MAX_DURATION, Math.max(MIN_DURATION, gap));

    const step = (now) => {
      const t = Math.min(1, (now - now0) / duration);
      const lat = from[0] + (to[0] - from[0]) * t;
      const lng = from[1] + (to[1] - from[1]) * t;
      currentRef.current = [lat, lng];
      marker.setLatLng(currentRef.current);
      if (followRef.current) centerOn(map, marker);
      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else if (followRef.current) {
        // Os tiles só se atualizam no fim do movimento, como num arrasto.
        map.fire('moveend');
      }
    };
    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position[0], position[1]]);

  return null;
}
