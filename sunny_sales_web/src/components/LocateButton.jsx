import React, { useState } from 'react';
import { useMap } from 'react-leaflet';

export default function LocateButton({ currentPos = null, onLocationFound, onClick, disabled = false }) {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const handleLocate = () => {
    if (onClick) onClick();

    if (currentPos && currentPos.lat != null && currentPos.lng != null) {
      // Já temos a posição do watchPosition (o ponto azul no mapa): centra já,
      // sem esperar por um novo fix de GPS — em telemóveis um pedido de alta
      // precisão com maximumAge: 0 pode demorar vários segundos ou expirar,
      // deixando o botão aparentemente morto.
      if (onLocationFound) onLocationFound({ lat: currentPos.lat, lng: currentPos.lng });
      map.setView([currentPos.lat, currentPos.lng], 18, { animate: false });
    } else {
      setLocating(true);
      const onFound = (e) => {
        map.off('locationerror', onError);
        setLocating(false);
        const { lat, lng } = e.latlng;
        if (onLocationFound) onLocationFound({ lat, lng });
        map.setView([lat, lng], 18, { animate: false });
      };

      const onError = (e) => {
        map.off('locationfound', onFound);
        setLocating(false);
        // code 1 = PERMISSION_DENIED (bloqueado pelo utilizador ou pelo navegador)
        if (e && e.code === 1) {
          alert('O acesso à localização está bloqueado. Permita a localização nas definições do navegador e tente novamente.');
        } else {
          alert('Não foi possível obter a sua localização. Tente novamente.');
        }
      };

      map.once('locationfound', onFound);
      map.once('locationerror', onError);
      map.locate({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    }
  };

  return (
    <button
      className="locate-btn"
      onClick={handleLocate}
      aria-label="Localizar-me"
      disabled={disabled}
    >
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
