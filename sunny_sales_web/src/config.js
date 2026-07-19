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

// (em português) Chave da API do MapTiler, definida em build pela variável
// `VITE_MAPTILER_KEY` (obtém-se gratuitamente em https://cloud.maptiler.com/account/keys/).
export const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || '';

// Estilo do MapTiler usado nos mapas da aplicação.
export const MAPTILER_STYLE = 'topo-v2';

// Configuração partilhada da camada de tiles: com chave usa o estilo "Topo"
// do MapTiler; sem chave mantém o estilo anterior (CARTO Voyager) para que o
// mapa continue a funcionar. Usar como `<TileLayer {...TILE_LAYER} />`.
export const TILE_LAYER = MAPTILER_KEY
  ? {
      url: `https://api.maptiler.com/maps/${MAPTILER_STYLE}/256/{z}/{x}/{y}{r}.png?key=${MAPTILER_KEY}`,
      attribution:
        '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      maxZoom: 19,
    }
  : {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    };
