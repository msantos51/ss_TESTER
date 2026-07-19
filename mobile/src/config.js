export const BASE_URL = 'https://sstester-production.up.railway.app';
export const WEB_URL = 'https://laudable-learning-production-a293.up.railway.app';

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

// Configuração partilhada da camada de tiles (sempre Leaflet; só muda a
// origem das imagens): com chave usa o estilo "Topo" do MapTiler; sem chave
// usa o mapa topográfico da Esri, gratuito e sem registo, com cores
// semelhantes. Usar como `<TileLayer {...TILE_LAYER} />`.
export const TILE_LAYER = MAPTILER_KEY
  ? {
      url: `https://api.maptiler.com/maps/${MAPTILER_STYLE}/256/{z}/{x}/{y}{r}.png?key=${MAPTILER_KEY}`,
      attribution:
        '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      maxZoom: 19,
    }
  : {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution:
        'Tiles &copy; Esri &mdash; Esri, TomTom, Garmin, FAO, NOAA, USGS, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>, and the GIS User Community',
      maxZoom: 19,
    };
