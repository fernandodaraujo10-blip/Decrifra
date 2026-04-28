import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

const mercadoPagoToken = defineSecret("MERCADO_PAGO_ACCESS_TOKEN");

const PRICES: Record<string, number> = {
  mensal: 14.90,
  trimestral: 37.90,
  semestral: 59.90,
  anual: 99.90,
};

const PLAN_LABELS: Record<string, string> = {
  mensal: "Decifra Premium — Mensal",
  trimestral: "Decifra Premium — Trimestral",
  semestral: "Decifra Premium — Semestral",
  anual: "Decifra Premium — Anual",
};

export const createCheckout = onCall(
  {
    region: "southamerica-east1",
    secrets: ["MERCADO_PAGO_ACCESS_TOKEN"],
  },
  async (request) => {
    // Verificação de autenticação
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Usuário não autenticado.");
    }

    const { planId } = request.data as { planId: string };

    if (!planId || !PRICES[planId]) {
      throw new HttpsError(
        "invalid-argument",
        "planId inválido. Use: mensal, trimestral, semestral ou anual."
      );
    }

    const uid = request.auth.uid;
    const price = PRICES[planId];
    const title = PLAN_LABELS[planId];
    const accessToken = mercadoPagoToken.value();

    // Cria preferência de pagamento no Mercado Pago
    const body = {
      items: [
        {
          id: planId,
          title,
          quantity: 1,
          currency_id: "BRL",
          unit_price: price,
        },
      ],
      back_urls: {
        success: "https://decifra.app/pagamento-confirmado.html",
        failure: "https://decifra.app",
        pending: "https://decifra.app",
      },
      auto_return: "approved",
      external_reference: uid,
    };

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro ao criar preferência MP:", errorText);
      throw new HttpsError(
        "internal",
        "Erro ao criar preferência de pagamento."
      );
    }

    const preference = await response.json();

    return { checkoutUrl: preference.init_point as string };
  }
);
