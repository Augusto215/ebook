import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MercadoPagoConfig, Preference } from "mercadopago";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const FRONTEND_URL = process.env.FRONTEND_URL || `http://localhost:${PORT}`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const products = {
  ebook_starter: {
    title: "Ebook Starter",
    description: "Guia prático para começar com estratégias aplicáveis.",
    price: 37
  },
  ebook_pro: {
    title: "Ebook Pro",
    description: "Conteúdo avançado com framework de crescimento.",
    price: 97
  },
  curso_mentoria: {
    title: "Curso Completo + Mentoria",
    description: "Formação completa com suporte e acompanhamento.",
    price: 257
  }
};

const nonCreditPaymentTypes = [
  { id: "ticket" },
  { id: "atm" },
  { id: "bank_transfer" },
  { id: "debit_card" },
  { id: "prepaid_card" }
];

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/create-preference", async (req, res) => {
  try {
    if (!ACCESS_TOKEN) {
      return res.status(500).json({
        error: "Token de acesso do Mercado Pago não configurado no servidor."
      });
    }

    const { productId } = req.body || {};
    const selectedProduct = products[productId];

    if (!selectedProduct) {
      return res.status(400).json({ error: "Produto inválido." });
    }

    const mpClient = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });
    const preferenceClient = new Preference(mpClient);

    const preferencePayload = {
      items: [
        {
          id: productId,
          title: selectedProduct.title,
          description: selectedProduct.description,
          quantity: 1,
          currency_id: "BRL",
          unit_price: selectedProduct.price
        }
      ],
      external_reference: productId,
      payment_methods: {
        excluded_payment_types: nonCreditPaymentTypes,
        installments: 12
      },
      back_urls: {
        success: `${FRONTEND_URL}/?status=success`,
        failure: `${FRONTEND_URL}/?status=failure`,
        pending: `${FRONTEND_URL}/?status=pending`
      },
      statement_descriptor: "EBOOK PAULO H"
    };

    if (process.env.MERCADO_PAGO_WEBHOOK_URL) {
      preferencePayload.notification_url = process.env.MERCADO_PAGO_WEBHOOK_URL;
    }

    const preference = await preferenceClient.create({ body: preferencePayload });

    return res.status(200).json({
      id: preference.id,
      init_point: preference.init_point
    });
  } catch (error) {
    const message = error?.message || "Erro interno ao criar checkout.";
    return res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado em ${FRONTEND_URL}`);
});
