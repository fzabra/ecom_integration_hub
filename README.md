# Ecom Integration Hub

Projeto de portfólio com foco em integrações para ecommerce.

## Demo Live

- URL: `https://ecom-integration-hub-api.vercel.app/?api=https://ecom-integration-api.onrender.com&worker=https://ecom-integration-worker.onrender.com`
- Observação: no plano free do Render, o primeiro acesso pode levar alguns segundos devido ao wake-up da instância.

## O que demonstra

- APIs REST e webhooks
- SaaS (pagamento mock estilo Stripe)
- ERP (sync de pedido e estoque no worker)
- PIM (refresh de catálogo no worker)
- IA (mock de recomendação/embedding)
- Analytics (evento `purchase` mock)

## Arquitetura

- `apps/web`: storefront simples (Node + HTML)
- `apps/api`: catálogo, carrinho, checkout, evento `order.created`
- `services/integration-worker`: consumidor Redis para integrações
- `postgres`: persistência de catálogo/pedido
- `redis`: mensageria pub/sub

Detalhes:
- [architecture.md](docs/architecture.md)
- [integrations.md](docs/integrations.md)
- [event-flow.md](docs/event-flow.md)

## Rodar com Docker

```bash
docker compose up --build
```

Acesse:
- Web: `http://localhost:3000`
- API: `http://localhost:3001/health`
- Worker events: `http://localhost:3003/events`

## Rodar local (sem Docker)

Pré-requisitos: PostgreSQL e Redis locais.

```bash
npm install
npm run dev
```

## Endpoints principais

- `GET /api/products`
- `GET /api/cart`
- `POST /api/cart/items`
- `DELETE /api/cart/items/:productId`
- `POST /api/checkout`
- `GET /api/orders`

## Fluxo de demonstração

1. Adicione produtos no carrinho pela web.
2. Finalize compra.
3. Veja logs de integração em `http://localhost:3003/events`.

## Deploy recomendado (Vercel + Render)

### 1) Backend no Render

Crie 2 serviços no Render:
- `api` (Web Service)
- `integration-worker` (Worker ou Web Service)

Use estes comandos:
- API build: `npm install`
- API start: `npm --workspace apps/api run start`
- Worker build: `npm install`
- Worker start: `npm --workspace services/integration-worker run start`

Configure variáveis:
- API:
  - `PORT=10000` (ou porta padrão do Render)
  - `DATABASE_URL=<postgres externo>`
  - `REDIS_URL=<redis externo>`
  - `WEBHOOK_TARGETS=<url-do-worker>/webhooks/mock`
- Worker:
  - `PORT=10000` (se for Web Service)
  - `REDIS_URL=<redis externo>`
  - `ERP_PROVIDER=tiny-mock`
  - `PIM_PROVIDER=akeneo-mock`
  - `AI_PROVIDER=local-embeddings-mock`
  - `ANALYTICS_PROVIDER=ga4-mock`

### 2) Frontend no Vercel

Este repositório já inclui:
- `vercel.json` (gera `dist` com o frontend estático)

Depois do deploy, configure a URL da API/worker na própria URL do site:

```text
https://SEU-SITE.vercel.app/?api=https://SEU-API.onrender.com&worker=https://SEU-WORKER.onrender.com
```

A página salva esses valores em `localStorage`, então você configura uma vez e segue usando normalmente.
