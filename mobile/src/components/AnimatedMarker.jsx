import React, { useEffect, useRef } from 'react';
import { Marker } from 'react-leaflet';

// Marker que anima suavemente entre posições em vez de saltar instantaneamente
// para a nova posição recebida do GPS — disfarça pequenas oscilações de
// precisão que ainda passem pelos filtros de distância/accuracy.
export default function AnimatedMarker({ position, icon }) {
  const markerRef = useRef(null);
  const displayedRef = useRef(position);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) {
      displayedRef.current = position;
      return;
    }
    const from = displayedRef.current;
    const to = position;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const duration = 500;
    const start = performance.now();

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const lat = from[0] + (to[0] - from[0]) * t;
      const lng = from[1] + (to[1] - from[1]) * t;
      marker.setLatLng([lat, lng]);
      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        displayedRef.current = to;
      }
    };
    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position[0], position[1]]);

  return <Marker ref={markerRef} position={displayedRef.current} icon={icon} />;
}
