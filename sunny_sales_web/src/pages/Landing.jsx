import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { FiArrowUpRight } from 'react-icons/fi';
import { BASE_URL, TILE_LAYER } from '../config';
import './Landing.css';

// (em português) Página de entrada. O mapa completo vive em /mapa; aqui
// aparece uma pré-visualização viva (não arrastável) que serve de convite.

const STEPS = [
  {
    n: '1',
    title: 'Abre o mapa',
    body: 'Nada para instalar. O mapa abre já na tua praia e mostra quem está a vender agora.',
  },
  {
    n: '2',
    title: 'Filtra o que queres',
    body: 'Bolas de Berlim, gelados ou acessórios — e a distância a que estás disposto a andar.',
  },
  {
    n: '3',
    title: 'Vai ao encontro',
    body: 'Vês o vendedor a mover-se em tempo real, os produtos e como podes pagar.',
  },
];

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function vendorPinHtml(color) {
  return `<div class="vendor-pin-marker" style="--pin-color: ${escapeHtml(color)};"><span class="vendor-pin-core"></span></div>`;
}

function FitVendors({ vendors }) {
  const map = useMap();
  useEffect(() => {
    if (!vendors.length) return;
    const bounds = L.latLngBounds(vendors.map((v) => [v.current_lat, v.current_lng]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15, animate: false });
  }, [vendors, map]);
  return null;
}

function HeroMap({ vendors }) {
  return (
    <MapContainer
      center={[38.7169, -9.1399]}
      zoom={12}
      className="landing-hero-map"
      zoomControl={false}
      attributionControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      keyboard={false}
    >
      <TileLayer {...TILE_LAYER} />
      <FitVendors vendors={vendors} />
      {vendors.map((v) => (
        <Marker
          key={v.id}
          position={[v.current_lat, v.current_lng]}
          icon={L.divIcon({
            html: vendorPinHtml(v.pin_color || '#1D5C3A'),
            className: 'vendor-pin',
            iconSize: [28, 34],
            iconAnchor: [14, 30],
          })}
        />
      ))}
    </MapContainer>
  );
}

export default function Landing() {
  const [vendors, setVendors] = useState([]);

  // O mesmo endpoint público do mapa. Falha em silêncio: sem vendedores a
  // pré-visualização continua a ser um mapa, só sem pins.
  useEffect(() => {
    let alive = true;
    const load = () => {
      axios
        .get(`${BASE_URL}/vendors/`)
        .then((res) => {
          if (!alive) return;
          const list = Array.isArray(res.data) ? res.data : [];
          setVendors(list.filter((v) => v.current_lat && v.current_lng));
        })
        .catch(() => {});
    };
    load();
    const t = setInterval(load, 15000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const activeLabel = `${vendors.length} ${vendors.length === 1 ? 'vendedor ativo' : 'vendedores ativos'}`;

  return (
    <div className="landing">
      <section className="landing-hero">
        <div className="landing-hero-text">
          <span className="landing-live">
            <span className="landing-live-dot" aria-hidden="true" />
            {activeLabel}
          </span>
          <h1 className="landing-title">
            Encontra vendedores de praia perto de ti, em tempo real
          </h1>
          <p className="landing-lead">
            Bolas de Berlim, gelados e acessórios de praia. Vês onde estão agora,
            sem instalar nada e sem sair da toalha.
          </p>
          <div className="landing-actions">
            <Link to="/mapa" className="landing-btn landing-btn--primary">
              Ver o mapa agora
            </Link>
            <a href="#como-funciona" className="landing-btn landing-btn--ghost">
              Como funciona
            </a>
          </div>
          <dl className="landing-stats">
            <div>
              <dt>Tempo real</dt>
              <dd>posições atualizadas ao segundo</dd>
            </div>
            <div>
              <dt>Sem instalar</dt>
              <dd>abre no browser do telemóvel</dd>
            </div>
            <div>
              <dt>Grátis</dt>
              <dd>para quem está na praia</dd>
            </div>
          </dl>
        </div>

        <div className="landing-hero-visual">
          <div className="landing-hero-frame">
            <HeroMap vendors={vendors} />
            <Link to="/mapa" className="landing-hero-cta">
              Explorar o mapa completo
              <FiArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-section" id="como-funciona">
        <h2 className="landing-h2">Como funciona</h2>
        <p className="landing-section-lead">Três passos, nenhum registo.</p>
        <ol className="landing-steps">
          {STEPS.map((s) => (
            <li key={s.n} className="landing-step">
              <span className="landing-step-n" aria-hidden="true">{s.n}</span>
              <h3 className="landing-step-title">{s.title}</h3>
              <p className="landing-step-body">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-section landing-section--flush">
        <div className="landing-banner">
          <div>
            <h2 className="landing-banner-title">Praia sustentável</h2>
            <p className="landing-banner-body">
              Menos voltas à procura de quem vende significa menos desperdício e
              vendedores que trabalham onde há gente. O mapa serve as duas pontas.
            </p>
          </div>
          <Link to="/sustentabilidade" className="landing-banner-btn">
            Saber mais
          </Link>
        </div>
      </section>
    </div>
  );
}
