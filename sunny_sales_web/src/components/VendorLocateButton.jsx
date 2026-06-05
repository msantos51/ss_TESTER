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
      <svg className="locate-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6"/>
        <line x1="12" y1="1" x2="12" y2="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="12" y1="20" x2="12" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="1" y1="12" x2="4" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="20" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </button>
  );
}
