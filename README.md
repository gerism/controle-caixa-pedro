# Controle Caixa Pedro

App web de controle de caixa: entradas, saídas, resumo do dia e fechamento do mês.
Acessa pelo navegador, tanto no computador da loja quanto no celular.

## Rodando local (pra testar no seu PC antes de subir)

1. `npm install`
2. Copie `.env.example` pra `.env` e preencha `DATABASE_URL` com um PostgreSQL
   (pode ser um Postgres do Railway mesmo, ou um local).
3. `npm run migrate` — cria as tabelas.
4. `node src/create-user.js gerinho suasenha123` — cria seu usuário de login.
5. `npm start` — sobe o servidor em `http://localhost:3000`.

## Deploy no Railway

1. Crie um projeto novo no Railway e suba este código (pode conectar direto
   com o GitHub, como você já faz nos outros projetos, ou usar `railway up`).
2. No mesmo projeto, adicione um banco **PostgreSQL** (Railway cria a variável
   `DATABASE_URL` sozinho e já conecta no seu serviço).
3. Em **Variables** do serviço, adicione `JWT_SECRET` com um texto aleatório
   grande (ex: gere um em https://www.uuidgenerator.net/ ou similar).
4. Depois do primeiro deploy, rode a migração uma vez. O jeito mais simples:
   abra o **Shell** do serviço no Railway (ou rode `railway run npm run migrate`
   pela CLI, com o projeto linkado) e execute `npm run migrate`.
5. Crie seu usuário do mesmo jeito: `railway run node src/create-user.js
   gerinho suasenha123`.
6. Pronto — o Railway te dá uma URL pública (ex:
   `caixa-loja-production.up.railway.app`). Abre ela no navegador do
   computador da loja e no navegador do celular, faz login, e já usa.

## Quando for abrir uma conta separada pro cliente

Quando chegar a hora, é só repetir o mesmo processo (passos 1 a 5) num
projeto novo do Railway, na conta do cliente — o código é o mesmo, só muda
onde ele roda e o banco de dados (cada loja com seus próprios dados).

## Estrutura

```
src/
  index.js            servidor Express, junta tudo
  db.js               conexão com o PostgreSQL
  migrate.js          roda o migrations/001_init.sql
  create-user.js       script pra criar usuário de login
  middleware/auth.js   confere se o usuário está logado
  routes/auth.js        login, logout
  routes/lancamentos.js  criar/listar lançamentos, resumo do dia e do mês
public/
  login.html / painel.html   as duas telas
  css/style.css               visual (mesmas cores do mockup)
  js/login.js / painel.js     lógica de cada tela
migrations/001_init.sql       cria as tabelas usuarios e lancamentos
```
