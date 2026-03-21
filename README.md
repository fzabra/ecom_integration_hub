# Ecom Integration Hub

Portfolio project focused on ecommerce integrations.

## Demo Live

- URL: [`https://ecom-integration-hub-api.vercel.app/?api=https://ecom-integration-api.onrender.com&worker=https://ecom-integration-worker.onrender.com`](https://ecom-integration-hub-api.vercel.app/?api=https://ecom-integration-api.onrender.com&worker=https://ecom-integration-worker.onrender.com)
- Note: on Render's free plan, the first request may take a few seconds due to instance wake-up.


## Health API
https://ecom-integration-api.onrender.com/health

https://ecom-integration-worker.onrender.com/health

## What It Demonstrates

- REST APIs and webhooks
- SaaS (Stripe-style mock payment)
- ERP (order and inventory sync in the worker)
- PIM (catalog refresh in the worker)
- AI (mock recommendation/embedding)
- Analytics (mock `purchase` event)

## Architecture

- `apps/web`: simple storefront (Node + HTML)
- `apps/api`: catalog, cart, checkout, `order.created` event
- `services/integration-worker`: Redis consumer for integrations
- `postgres`: catalog/order persistence
- `redis`: pub/sub messaging

Details:
- [architecture.md](docs/architecture.md)
- [integrations.md](docs/integrations.md)
- [event-flow.md](docs/event-flow.md)

## Run with Docker

```bash
docker compose up --build
```

Access:
- Web: `http://localhost:3000`
- API: `http://localhost:3001/health`
- Worker events: `http://localhost:3003/events`

## Run Locally (Without Docker)

Prerequisites: local PostgreSQL and Redis.

```bash
npm install
npm run dev
```

## Main Endpoints

- `GET /api/products`
- `GET /api/cart`
- `POST /api/cart/items`
- `DELETE /api/cart/items/:productId`
- `POST /api/checkout`
- `GET /api/orders`

## Demo Flow

1. Add products to the cart through the web app.
2. Complete checkout.
3. View integration logs at `http://localhost:3003/events`.

## Recommended Deployment (Vercel + Render)

### 1) Backend on Render

Create 2 services on Render:
- `api` (Web Service)
- `integration-worker` (Worker or Web Service)

Use these commands:
- API build: `npm install`
- API start: `npm --workspace apps/api run start`
- Worker build: `npm install`
- Worker start: `npm --workspace services/integration-worker run start`

Configure environment variables:
- API:
  - `PORT=10000` (or Render default port)
  - `DATABASE_URL=<external-postgres>`
  - `REDIS_URL=<external-redis>`
  - `WEBHOOK_TARGETS=<worker-url>/webhooks/mock`
- Worker:
  - `PORT=10000` (if running as Web Service)
  - `REDIS_URL=<external-redis>`
  - `ERP_PROVIDER=tiny-mock`
  - `PIM_PROVIDER=akeneo-mock`
  - `AI_PROVIDER=local-embeddings-mock`
  - `ANALYTICS_PROVIDER=ga4-mock`

### 2) Frontend on Vercel

This repository already includes:
- `vercel.json` (builds `dist` with the static frontend)

After deployment, configure the API/worker URL directly in the site URL:

```text
https://YOUR-SITE.vercel.app/?api=https://YOUR-API.onrender.com&worker=https://YOUR-WORKER.onrender.com
```

The page stores these values in `localStorage`, so you only need to configure them once.
