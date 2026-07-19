// (em português) URL base do backend.
// Pode ser definida pela variável de ambiente `VITE_BASE_URL` quando
// iniciar o Vite. Caso não seja fornecida, usa a origem atual da página
// (funciona em produção onde frontend e backend partilham o mesmo servidor).
export const BASE_URL = import.meta.env.VITE_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000');

export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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
