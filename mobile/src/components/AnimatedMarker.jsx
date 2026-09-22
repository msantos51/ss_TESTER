import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Duração da interpolação entre duas leituras de GPS. Fixá-la em meio segundo
// dava um pin que andava meio segundo e parava até à leitura seguinte — o
// andamento aos empurrões que se nota na app. Aqui a duração acompanha o
// intervalo real entre leituras, dentro de limites sãos, para o pin deslizar
// sem interrupções à velocidade a que o vendedor anda mesmo.
const MIN_DURATION = 300;
const MAX_DURATION = 1600;
const DEFAULT_DURATION = 600;

// Marcador do vendedor, desenhado à mão em vez de pelo <Marker> do
// react-leaflet. O motivo é a fluidez: o rumo muda dez vezes por segundo e o
// componente do react-leaflet responde a cada mudança de ícone trocando o
// elemento no DOM — o que corta a animação em curso, reinicia o halo a pulsar
// e devolve o pin à última posição entregue. Aqui o elemento é criado uma vez;
// a posição muda por interpolação e o rumo por variável CSS, sem tocar no DOM.
export default function AnimatedMarker({ position, icon, hasHeading }) {
  const map = useMap();
  const markerRef = useRef(null);
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
    }).addTo(map);
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
      if (t < 1) animFrameRef.current = requestAnimationFrame(step);
    };
    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position[0], position[1]]);

  return null;
}
