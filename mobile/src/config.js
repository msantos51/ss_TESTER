export const BASE_URL = 'https://sstester-production.up.railway.app';
export const WEB_URL = 'https://laudable-learning-production-a293.up.railway.app';

export function mediaUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE_URL.replace(/\/$/, '')}/${path}`;
}

// (em português) Configuração partilhada da camada de tiles dos mapas Leaflet.
// A CARTO passou a exigir chave de API nos basemaps: sem chave, os tiles vêm
// carimbados com "API KEY REQUIRED". Por isso só usamos a CARTO quando existe
// `VITE_CARTO_API_KEY`; caso contrário caímos para os tiles padrão do
// OpenStreetMap, que são gratuitos e não precisam de chave.
// Usar como `<TileLayer {...TILE_LAYER} />`.
const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY || '';

export const TILE_LAYER = CARTO_API_KEY
  ? {
      url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?api_key=${CARTO_API_KEY}`,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }
  : {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    };
