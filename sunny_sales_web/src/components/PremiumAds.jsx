import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiArrowUpRight } from 'react-icons/fi';
import { BASE_URL } from '../config';
import './PremiumAds.css';

// (em português) Publicidade aos vendedores Premium.
//
// Vantagem exclusiva de quem é Premium E está ativo (a partilhar localização):
// o vendedor ganha uma frase de destaque no site — "[nome] está a vender
// [produto] na zona [local]" — que, ao ser clicada, abre o mapa já centrado
// no seu pin (/mapa?vendor=<id>, tratado em Home.jsx).
//
// "Ativo" é lido do mesmo endpoint público do mapa: o servidor só devolve
// current_lat/current_lng a quem tem uma rota a decorrer, por isso um vendedor
// com coordenadas é, por definição, um vendedor a partilhar a localização.

// Quantos anúncios mostrar de cada vez. Também limita as chamadas de
// geocodificação inversa (uma por vendedor visível).
const MAX_ADS = 6;

// Cache de zona por par de coordenadas (~100 m): evita repetir o reverse
// geocode a cada atualização de posição. Vive fora do componente para
// sobreviver a re-renders.
const zoneCache = new Map();

function coordKey(lat, lng) {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

// Nominatim (o mesmo serviço do cartão de meteorologia). Devolve o nome da
// zona mais útil disponível — bairro, freguesia ou localidade — ou null.
async function fetchZone(lat, lng, signal) {
  const key = coordKey(lat, lng);
  if (zoneCache.has(key)) return zoneCache.get(key);
  try {
    const res = await fetch(
      `https://nominatim.base.org/reverse?format=json&zoom=16&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'pt' }, signal }
    );
    const data = await res.json();
    const a = data.address || {};
    const zone =
      a.neighbourhood || a.suburb || a.village || a.town ||
      a.city_district || a.city || a.county || null;
    zoneCache.set(key, zone);
    return zone;
  } catch {
    return null;
  }
}

export default function PremiumAds() {
  const [ads, setAds] = useState([]);
  // Zonas resolvidas por id de vendedor (assíncronas, chegam depois da lista).
  const [zones, setZones] = useState({});
  const acRef = useRef(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      axios
        .get(`${BASE_URL}/vendors/`)
        .then((res) => {
          if (!alive) return;
          const list = Array.isArray(res.data) ? res.data : [];
          // Premium E ativo (com coordenadas atuais = a partilhar localização).
          const premium = list.filter(
            (v) => v.is_premium && v.current_lat != null && v.current_lng != null
          );
          setAds(premium.slice(0, MAX_ADS));
        })
        .catch(() => {});
    };
    load();
    const t = setInterval(load, 15000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  // Resolve a zona de cada anúncio visível. Um AbortController por ciclo
  // cancela pedidos pendentes quando a lista muda ou o componente desmonta.
  useEffect(() => {
    if (acRef.current) acRef.current.abort();
    if (!ads.length) return undefined;
    const ac = new AbortController();
    acRef.current = ac;
    let alive = true;
    (async () => {
      for (const v of ads) {
        const zone = await fetchZone(v.current_lat, v.current_lng, ac.signal);
        if (!alive) return;
        if (zone) setZones((prev) => ({ ...prev, [v.id]: zone }));
      }
    })();
    return () => { alive = false; ac.abort(); };
  }, [ads]);

  if (!ads.length) return null;

  return (
    <section className="premium-ads" aria-label="Vendedores Premium a vender agora">
      <div className="premium-ads-inner">
        <h2 className="premium-ads-title">A vender agora</h2>
        <p className="premium-ads-lead">
          Vendedores Premium ativos neste momento. Toca para os ver no mapa.
        </p>
        <ul className="premium-ads-list">
          {ads.map((v) => {
            const zone = zones[v.id];
            return (
              <li key={v.id}>
                <Link to={`/mapa?vendor=${v.id}`} className="premium-ad">
                  <span className="premium-ad-star" aria-hidden="true">★</span>
                  <span className="premium-ad-text">
                    <strong>{v.name}</strong> está a vender{' '}
                    <strong>{v.product}</strong>
                    {zone ? <> na zona <strong>{zone}</strong></> : null}
                  </span>
                  <FiArrowUpRight className="premium-ad-arrow" size={18} aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
