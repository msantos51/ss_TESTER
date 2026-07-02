import React from 'react';
import './PinColorPicker.css';

const PRESET_COLORS = [
  { name: 'Roxo', value: '#7B61FF' },
  { name: 'Azul', value: '#4BA3C3' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Vermelho', value: '#EF4444' },
  { name: 'Laranja', value: '#F97316' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Amarelo', value: '#EACC00' },
  { name: 'Teal', value: '#14B8A6' },
];

export default function PinColorPicker({ value, onChange }) {
  return (
    <div className="pcp-container">
      <div className="pcp-preview-section">
        <label className="pcp-preview-label">Pré-visualização do pin</label>
        <div className="pcp-preview-pin" style={{ '--pin-color': value }}>
          <div className="pcp-pin-marker">
            <div className="pcp-pin-dot" />
            <div className="pcp-pin-shadow" />
          </div>
        </div>
      </div>

      <div className="pcp-colors-section">
        <label className="pcp-colors-label">Selecione uma cor</label>
        <div className="pcp-colors-grid">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              className={`pcp-color-btn ${value === color.value ? 'active' : ''}`}
              onClick={() => onChange(color.value)}
              style={{ background: color.value }}
              title={color.name}
              aria-label={`Cor ${color.name}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
