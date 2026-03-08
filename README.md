# Ecommerce de Ebooks com Mercado Pago

Projeto com página de vendas moderna + backend Node.js para criar checkout do Mercado Pago.

## Produtos configurados
- Ebook Starter: `R$ 37`
- Ebook Pro: `R$ 97`
- Curso Completo + Mentoria: `R$ 257`

## Como rodar
1. Copie o arquivo de ambiente:
   ```bash
   cp .env.example .env
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor:
   ```bash
   npm run dev
   ```
4. Abra:
   ```text
   http://localhost:3000
   ```

## Fluxo de pagamento
- O frontend chama `POST /api/create-preference` com o produto.
- O backend cria uma `preference` no Mercado Pago com pagamento via cartão.
- O cliente é redirecionado para o checkout oficial do Mercado Pago.

## Importante
- Mantenha `MERCADO_PAGO_ACCESS_TOKEN` apenas no backend (`.env`).
- Não publique o token de acesso em frontend ou repositório público.
