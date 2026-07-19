import React from 'react';
import { Link } from 'react-router-dom';
import BeachMapVisuals from '../components/BeachMapVisuals';
import { FiArrowLeft } from 'react-icons/fi';
import './BeachVisualization.css';

export default function BeachVisualization() {
  return (
    <div className="beach-visualization-page">
      <header className="beach-viz-header">
        <Link to="/" className="beach-viz-back">
          <FiArrowLeft size={20} /> Voltar
        </Link>
        <h1 className="beach-viz-title">Elementos da Praia</h1>
      </header>

      <main className="beach-viz-main">
        <section className="beach-viz-section">
          <div className="beach-viz-content">
            <div className="beach-viz-description">
              <h2>Visualização dos Elementos da Praia</h2>
              <p>
                Elementos coloridos que representam os diferentes componentes de uma praia:
              </p>
              <ul className="beach-viz-legend">
                <li><span className="legend-color" style={{ backgroundColor: '#87CEEB' }} />Céu</li>
                <li><span className="legend-color" style={{ backgroundColor: '#0066CC' }} />Água profunda</li>
                <li><span className="legend-color" style={{ backgroundColor: '#4DB8E8' }} />Água rasa</li>
                <li><span className="legend-color" style={{ backgroundColor: '#F4D03F' }} />Areia</li>
                <li><span className="legend-color" style={{ backgroundColor: '#FFFFFF' }} />Espuma</li>
                <li><span className="legend-color" style={{ backgroundColor: '#228B22' }} />Algas</li>
                <li><span className="legend-color" style={{ backgroundColor: '#8B7355' }} />Rochas</li>
                <li><span className="legend-color" style={{ backgroundColor: '#FF6B6B' }} />Guarda-sol</li>
              </ul>
            </div>

            <BeachMapVisuals />
          </div>
        </section>

        <section className="beach-viz-info">
          <div className="beach-viz-info-content">
            <h2>Sobre o Mapa Visual</h2>
            <p>
              Este componente renderiza uma visualização artística de uma praia com elementos
              coloridos. Cada elemento possui uma cor específica para melhor identificação:
            </p>
            <div className="beach-viz-elements">
              <div className="element-card">
                <h3>🌊 Água</h3>
                <p>Representada em azul profundo (#0066CC) que transiciona para tons mais claros
                   conforme se aproxima da areia, representando a mudança de profundidade.</p>
              </div>
              <div className="element-card">
                <h3>🏖️ Areia</h3>
                <p>Amarela dourada (#F4D03F) com padrão de textura que simula grãos de areia.
                   O sombreamento gradual cria profundidade visual.</p>
              </div>
              <div className="element-card">
                <h3>🌊 Espuma</h3>
                <p>Branca (#FFFFFF) formada na linha de contato entre água e areia, representando
                   as ondas do mar chegando à praia.</p>
              </div>
              <div className="element-card">
                <h3>🪨 Rochas</h3>
                <p>Marrom (#8B7355) posicionadas estrategicamente na areia, com sombras para
                   criar efeito tridimensional realista.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
