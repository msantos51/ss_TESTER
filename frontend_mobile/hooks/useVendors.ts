// (em português) Hook para carregar e filtrar vendedores (placeholder).
import { useEffect, useState } from 'react';
import { getActiveVendors } from '~/services/vendor';

export function useVendors() {
  const [vendors, setVendors] = useState<any[]>([]);

  useEffect(() => {
    (async () => setVendors(await getActiveVendors()))();
  }, []);

  return { vendors, setVendors };
}
