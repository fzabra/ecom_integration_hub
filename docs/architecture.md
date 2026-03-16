# Architecture

## Contexto

Este projeto simula um ecommerce com camada de integrações orientada a eventos.

## Componentes

- Web: interface para catálogo/carrinho/checkout.
- API: domínio de ecommerce e publicação de eventos.
- Redis: transporte de eventos em pub/sub.
- Worker: integrações com ERP, PIM, IA e analytics.
- PostgreSQL: estado transacional (produtos, carrinho, pedidos).

## Decisões técnicas

- Checkout transacional no banco para evitar inconsistência de estoque.
- Evento `order.created` publicado após commit.
- Conectores externos em modo mock para portfólio sem custo alto.
