import { useEffect, useRef, useState } from 'react';

const THROTTLE_MS = 100;
const MAX_ACCURACY_DEG = 50;

// Devolve a direção (graus, 0 = norte, sentido horário) para onde o
// dispositivo está virado, combinando o heading do GPS (quando o vendedor
// se está a mover) com a bússola do dispositivo (quando está parado).
export default function useDeviceHeading() {
  const [heading, setHeading] = useState(null);
  const lastHeadingTs = useRef(0);
  const absEventFiredRef = useRef(false);
  const gpsMovingRef = useRef(false);
  const [compassReady, setCompassReady] = useState(false);

  useEffect(() => {
    if (
      typeof DeviceOrientationEvent === 'undefined' ||
      typeof DeviceOrientationEvent.requestPermission !== 'function'
    ) {
      setCompassReady(true);
      return;
    }
    DeviceOrientationEvent.requestPermission()
      .then((result) => setCompassReady(result === 'granted'))
      .catch(() => setCompassReady(false));
  }, []);

  useEffect(() => {
    if (!compassReady) return;

    const onAbsolute = (e) => {
      if (gpsMovingRef.current || e.alpha == null) return;
      const now = Date.now();
      if (now - lastHeadingTs.current < THROTTLE_MS) return;
      lastHeadingTs.current = now;
      absEventFiredRef.current = true;
      setHeading((360 - e.alpha) % 360);
    };

    const onOrientation = (e) => {
      if (gpsMovingRef.current || absEventFiredRef.current) return;
      const now = Date.now();
      if (now - lastHeadingTs.current < THROTTLE_MS) return;
      if (e.webkitCompassAccuracy != null && e.webkitCompassAccuracy >= 0 && e.webkitCompassAccuracy > MAX_ACCURACY_DEG) return;
      lastHeadingTs.current = now;
      let raw = null;
      if (e.webkitCompassHeading != null) {
        raw = e.webkitCompassHeading;
      } else if (e.alpha != null && e.absolute) {
        raw = (360 - e.alpha) % 360;
      }
      if (raw !== null) setHeading(raw);
    };

    window.addEventListener('deviceorientationabsolute', onAbsolute, true);
    window.addEventListener('deviceorientation', onOrientation, true);
    return () => {
      window.removeEventListener('deviceorientationabsolute', onAbsolute, true);
      window.removeEventListener('deviceorientation', onOrientation, true);
    };
  }, [compassReady]);

  // A chamar a partir do callback do watchPosition com pos.coords.heading/speed.
  const reportGpsHeading = (gpsHeading, speed) => {
    if (gpsHeading != null && !isNaN(gpsHeading) && speed != null && speed > 0.3) {
      gpsMovingRef.current = true;
      lastHeadingTs.current = Date.now();
      setHeading(gpsHeading);
    } else {
      gpsMovingRef.current = false;
    }
  };

  return { heading, reportGpsHeading };
}
