// Botão que localiza o utilizador e centraliza o mapa
import React, { useState } from 'react';
import { useMap } from 'react-leaflet';

// Componente que apresenta um botão para obter a localização do cliente
export default function LocateButton({ onLocationFound, onClick }) {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  // Função que solicita a localização e centraliza o mapa
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
    };

    const onError = () => {
      setLocating(false);
      alert('Não foi possível obter a sua localização.');
    };

    map.once('locationfound', onFound);
    map.once('locationerror', onError);
    map.locate({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  };

  // Renderização do botão de localização
  return (
    <button className="locate-btn" onClick={handleLocate} aria-label="Localizar-me">
      {locating ? <span className="loader" /> : '📍'}
    </button>
  );
}
