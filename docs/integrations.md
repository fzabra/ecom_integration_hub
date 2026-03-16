# Integrations

## APIs

- REST para catálogo/carrinho/checkout.
- Webhook out para alvos configuráveis via `WEBHOOK_TARGETS`.

## SaaS

- Pagamento mock com payload compatível com fluxo Stripe-like.

## ERP

- Worker registra sincronização de pedido e estoque.
- Provider configurável: `ERP_PROVIDER`.

## PIM

- Worker registra refresh de catálogo após compra.
- Provider configurável: `PIM_PROVIDER`.

## IA

- Worker registra atualização de recomendação/embedding.
- Provider configurável: `AI_PROVIDER`.

## Analytics

- Worker registra envio de evento `purchase`.
- Provider configurável: `ANALYTICS_PROVIDER`.
