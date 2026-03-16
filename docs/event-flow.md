# Event Flow

1. Usuário faz checkout na Web.
2. API valida carrinho e estoque, grava pedido e itens.
3. API simula pagamento SaaS e publica `order.created` no Redis.
4. API envia webhook para endpoints configurados.
5. Worker consome evento e executa integrações mock:
   - ERP sync
   - PIM refresh
   - IA recommendation update
   - analytics purchase event
