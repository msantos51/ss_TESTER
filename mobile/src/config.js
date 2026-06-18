export const BASE_URL = 'https://sstester-production.up.railway.app';
export const WEB_URL = 'https://laudable-learning-production-a293.up.railway.app';

export function mediaUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE_URL.replace(/\/$/, '')}/${path}`;
}
