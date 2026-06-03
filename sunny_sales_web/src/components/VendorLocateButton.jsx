import React from 'react';
import { useMap } from 'react-leaflet';

export default function VendorLocateButton({ vendor, onLocate }) {
  const map = useMap();

  const handleLocate = () => {
    if (vendor && vendor.current_lat && vendor.current_lng) {
      map.setView([vendor.current_lat, vendor.current_lng], 18, { animate: false });
    }
    onLocate?.();
  };

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
