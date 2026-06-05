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

      map.setView([lat, lng], 18, { animate: false });
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
      {locating ? (
        <span className="loader" />
      ) : (
        <svg className="locate-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6"/>
          <line x1="12" y1="1" x2="12" y2="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="12" y1="20" x2="12" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="1" y1="12" x2="4" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="20" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      )}
    </button>
  );
}
