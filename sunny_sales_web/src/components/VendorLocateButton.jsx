// Botão que centra o mapa no vendedor autenticado
import React from 'react';
import { useMap } from 'react-leaflet';

// Componente que apresenta um botão para localizar o vendedor
export default function VendorLocateButton({ vendor }) {
  const map = useMap();

  // Função que centraliza o mapa na posição atual do vendedor
  const handleLocate = () => {
    if (vendor && vendor.current_lat && vendor.current_lng) {
      map.flyTo([vendor.current_lat, vendor.current_lng], 16);
    }
  };

  // Renderização do botão que centra o mapa no vendedor
  return (
    <button
      className="vendor-locate-btn"
      onClick={handleLocate}
      aria-label="Localizar vendedor"
      disabled={!vendor}
    >
      {'📍'}
    </button>
  );
}
