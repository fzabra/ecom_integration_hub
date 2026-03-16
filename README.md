# Ecom Integration Hub

Projeto de portfólio com foco em integrações para ecommerce.

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

