import React from 'react';
import './PinColorPicker.css';

// Cores disponíveis para o pin do vendedor. As primeiras seis são a paleta
// sóbria da marca (sunny_sales_web/src/index.css); Verde floresta é a primeira
// por ser o que o site desenha a quem nunca escolheu cor nenhuma. A seguir vem
// uma família de tons mais vivos, para o pin saltar mais à vista no mapa — o
// site desenha o pin com a cor guardada (qualquer hex), por isso estas cores
// extra funcionam tal e qual no mapa do site.
// Quem já tiver guardada uma cor fora desta lista continua a vê-la (e
// selecionada) como uma amostra extra.
const PRESET_COLORS = [
  { name: 'Verde floresta', value: '#1D5C3A' },
  { name: 'Amarelo', value: '#F9B10B' },
  { name: 'Azul', value: '#2AA1B7' },
  { name: 'Azul-profundo', value: '#1D6F7E' },
  { name: 'Coral', value: '#BB3E03' },
  { name: 'Noite', value: '#0A252B' },
  // Tons vivos
  { name: 'Vermelho vivo', value: '#FF3B30' },
  { name: 'Laranja vivo', value: '#FF7A00' },
  { name: 'Rosa vivo', value: '#FF2D95' },
  { name: 'Roxo vivo', value: '#8B2FE8' },
  { name: 'Turquesa', value: '#00C2C7' },
  { name: 'Verde-lima', value: '#2FCB4F' },
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
