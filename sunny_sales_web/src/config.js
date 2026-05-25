// (em português) URL base do backend.
// Pode ser definida pela variável de ambiente `VITE_BASE_URL` quando
// iniciar o Vite. Caso não seja fornecida, usa a origem atual da página
// (funciona em produção onde frontend e backend partilham o mesmo servidor).
export const BASE_URL = import.meta.env.VITE_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000');
