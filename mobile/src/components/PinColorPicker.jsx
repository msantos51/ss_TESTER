import React from 'react';
import './PinColorPicker.css';

// As seis cores do design. Quem já tiver guardada uma cor fora desta lista
// continua a vê-la (e selecionada) como uma amostra extra.
const PRESET_COLORS = [
  { name: 'Sol', value: '#EE9B00' },
  { name: 'Oceano', value: '#147B9E' },
  { name: 'Coral', value: '#E63946' },
  { name: 'Verde', value: '#16A34A' },
  { name: 'Roxo', value: '#7B61FF' },
  { name: 'Azul-escuro', value: '#0B2A3D' },
];

export default function PinColorPicker({ value, onChange }) {
  const known = PRESET_COLORS.some((c) => c.value.toLowerCase() === (value || '').toLowerCase());
  const colors = known || !value
    ? PRESET_COLORS
    : [...PRESET_COLORS, { name: 'A tua cor', value }];

  return (
    <div className="ss-field">
      <span className="ss-label">Cor do pin no mapa</span>
      <div className="pcp-swatches">
        {colors.map((color) => (
          <button
            key={color.value}
            type="button"
            className={`pcp-swatch${value === color.value ? ' is-on' : ''}`}
            onClick={() => onChange(color.value)}
            style={{ backgroundColor: color.value }}
            title={color.name}
            aria-label={`Cor ${color.name}`}
            aria-pressed={value === color.value}
          />
        ))}
      </div>
    </div>
  );
}
