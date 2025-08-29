// src/types/index.ts
// Tipos TypeScript usados na aplicação mobile

export type Vendor = {
  // identificador único do vendedor
  id: number;
  // nome do vendedor
  name: string;
  // produto escolhido pelo vendedor
  product: 'Bolas de Berlim' | 'Gelados' | 'Acessórios de Praia';
  // latitude atual do vendedor, se disponível
  current_lat?: number | null;
  // longitude atual do vendedor, se disponível
  current_lng?: number | null;
  // indica se o vendedor está ativo
  is_active?: boolean;
  // URL da foto de perfil do vendedor
  photo_url?: string | null;
  // cor personalizada do marcador no mapa
  pin_color?: string | null;
};

