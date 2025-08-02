# Sunny Sales Mobile

Aplicação mobile para vendedores, criada com **Expo** (React Native).
Permite partilhar a localização continuamente, mesmo em background.

## Desenvolvimento rápido

1. Instale o Expo CLI se ainda não tiver:
   ```bash
   npm install -g expo-cli
   ```
2. Instale as dependências na pasta `sunny_sales_mobile`:
   ```bash
   npm install
   ```
3. Defina a variável `BASE_URL` em `src/config.js` com o endereço do backend.
4. Inicie a aplicação:
   ```bash
   npm start
   ```
   Depois utilize a app Expo Go ou um emulador para testar.

## Funcionalidades

- Login do vendedor e armazenamento do token JWT.
- Partilha de localização em segundo plano enquanto o trajeto estiver ativo.

A estrutura de pastas é semelhante à da aplicação web para facilitar a manutenção.
