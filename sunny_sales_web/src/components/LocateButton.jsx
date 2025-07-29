import React, { useState } from 'react';
import { useMap } from 'react-leaflet';

export default function LocateButton() {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const handleLocate = () => {
    setLocating(true);

    const onFound = (e) => {
      setLocating(false);
      const { lat, lng } = e.latlng;
      map.flyTo([lat, lng], 16);
      map.off('locationfound', onFound);
      map.off('locationerror', onError);
    };

    const onError = () => {
      setLocating(false);
      alert('Não foi possível obter a sua localização.');
      map.off('locationfound', onFound);
      map.off('locationerror', onError);
    };

    map.on('locationfound', onFound);
    map.on('locationerror', onError);
    map.locate({ enableHighAccuracy: true });
  };

  return (
    <button className="locate-btn" onClick={handleLocate} aria-label="Localizar-me">
      {locating ? <span className="loader" /> : '📍'}
    </button>
  );
}
