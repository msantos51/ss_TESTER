import React from 'react';
import { useMap } from 'react-leaflet';

export default function VendorLocateButton({ vendor }) {
  const map = useMap();

  const handleLocate = () => {
    if (vendor && vendor.current_lat && vendor.current_lng) {

      map.flyTo([vendor.current_lat, vendor.current_lng], 16);
    }
  };

  return (
    <button
      className="vendor-locate-btn"
      onClick={handleLocate}
      aria-label="Localizar vendedor"
      disabled={!vendor}
    >
      {'\ud83d\udccd'}
    </button>
  );
}

