export const BASE_URL = 'https://sstester-production.up.railway.app';
export const WEB_URL = 'https://laudable-learning-production-a293.up.railway.app';

export function mediaUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE_URL.replace(/\/$/, '')}/${path}`;
}

// (em português) Configuração partilhada da camada de tiles dos mapas
// Leaflet: estilo Voyager da CARTO, gratuito e sem chave de API.
// Usar como `<TileLayer {...TILE_LAYER} />`.
export const TILE_LAYER = {
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19,
};
