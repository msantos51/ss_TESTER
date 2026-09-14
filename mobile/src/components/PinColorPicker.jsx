import React from 'react';
import './PinColorPicker.css';

// As seis cores da paleta de verão do site (sunny_sales_web/src/index.css),
// pela mesma ordem em que lá aparecem: o pin do vendedor é lido no mapa do
// site, por isso não pode ser de outra família de cores. Verde floresta é o
// primeiro por ser o que o site desenha a quem nunca escolheu cor nenhuma.
// Quem já tiver guardada uma cor fora desta lista continua a vê-la (e
// selecionada) como uma amostra extra.
const PRESET_COLORS = [
  { name: 'Verde floresta', value: '#1D5C3A' },
  { name: 'Sol', value: '#EE9B00' },
  { name: 'Oceano', value: '#0A9396' },
  { name: 'Azul-céu', value: '#005F73' },
  { name: 'Coral', value: '#BB3E03' },
  { name: 'Noite', value: '#001219' },
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
