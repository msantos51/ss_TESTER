// src/types/index.ts
export type Vendor = {
  id: number;
  name: string;
  product: 'Bolas de Berlim' | 'Gelados' | 'Acessórios de Praia';
  current_lat?: number | null;
  current_lng?: number | null;
  is_active?: boolean;
  photo_url?: string | null;
};
