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
// Leaflet: estilo personalizado criado no MapTiler (raster tiles 256px,
// com suporte retina via `{r}`). A chave e o ID do mapa podem ser
// substituídos pelas variáveis de ambiente `VITE_MAPTILER_KEY` e
// `VITE_MAPTILER_MAP_ID`. Usar como `<TileLayer {...TILE_LAYER} />`.
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || 'Ru4jRsFJoXg3TmEsFaOC';
const MAPTILER_MAP_ID =
  import.meta.env.VITE_MAPTILER_MAP_ID || '019f805d-3125-7863-9a77-ab58ad966b58';

export const TILE_LAYER = {
  url: `https://api.maptiler.com/maps/${MAPTILER_MAP_ID}/256/{z}/{x}/{y}{r}.png?key=${MAPTILER_KEY}`,
  attribution:
    '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
  crossOrigin: true,
};
