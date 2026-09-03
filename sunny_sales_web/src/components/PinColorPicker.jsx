import React from 'react';
import './PinColorPicker.css';

// (em português) O pin é lido num telemóvel ao sol, sobre os tiles claros do
// mapa (#e9eaec). As cores anteriores davam entre 1,33:1 e 3,49:1 contra esse
// fundo — o amarelo era praticamente invisível. Estas seis dão todas ≥6:1
// contra o tile e ≥7:1 contra o branco do miolo do pin.
//
// O coral (#C9371B) está deliberadamente fora desta lista: é a cor do que é
// acionável e não deve aparecer como pin, ou deixa de significar isso.
const PRESET_COLORS = [
  { name: 'Verde floresta', value: '#1D5C3A' },
  { name: 'Teal', value: '#0F5F6E' },
  { name: 'Azul', value: '#1A4F9C' },
  { name: 'Roxo', value: '#5B3C9E' },
  { name: 'Castanho', value: '#6B4423' },
  { name: 'Vinho', value: '#8E2A5B' },
];

export default function PinColorPicker({ value, onChange }) {
  return (
    <div className="pcp-container">
      {/* A etiqueta do campo é dada pelo formulário que usa o componente;
          aqui evitamos uma segunda etiqueta redundante em maiúsculas. */}
      <div className="pcp-preview-section">
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
