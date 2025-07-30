import React from 'react';
import { useMap } from 'react-leaflet';

export default function VendorLocateButton({ vendor }) {
  const map = useMap();

  if (!vendor) return null;

  const handleLocate = () => {
    if (vendor.current_lat && vendor.current_lng) {
      map.flyTo([vendor.current_lat, vendor.current_lng], 16);
    }
  };

  return (
    <button
      className="vendor-locate-btn"
      onClick={handleLocate}
      aria-label="Localizar vendedor"
    >
      {'\ud83d\udccd'}
    </button>
  );
}

