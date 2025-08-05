import React, { useState } from 'react';
import { useMap } from 'react-leaflet';


export default function LocateButton({ onLocationFound, onClick }) {

  const map = useMap();
  const [locating, setLocating] = useState(false);

  const handleLocate = () => {
    if (onClick) onClick();
    setLocating(true);

    const onFound = (e) => {
      setLocating(false);
      const { lat, lng } = e.latlng;

      if (onLocationFound) {
        onLocationFound({ lat, lng });
      }

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
    map.locate({ enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 });
  };

  return (
    <button className="locate-btn" onClick={handleLocate} aria-label="Localizar-me">
      {locating ? <span className="loader" /> : '📍'}
    </button>
  );
}
