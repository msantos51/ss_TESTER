# Sunny Sales - Web

Aplicação web em React utilizando Vite.

## Desenvolvimento

```bash
npm install
npm run dev
```

Defina `VITE_BASE_URL` para apontar para o backend (por omissão `http://localhost:8000`).

### Mapas

Os mapas usam, por omissão, os tiles gratuitos do OpenStreetMap (não requerem
chave). Para voltar ao estilo Voyager da CARTO, defina `VITE_CARTO_API_KEY` com
uma chave válida — sem ela a CARTO devolve tiles carimbados com
"API KEY REQUIRED".
