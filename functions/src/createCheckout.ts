import { onCall, HttpsError } from "firebase-functions/v2/https";
import { MercadoPagoConfig, Preference } from "mercadopago";

export const createCheckout = onCall({
  secrets: ["MERCADO_PAGO_ACCESS_TOKEN"],
  region: "southamerica-east1"
}, async (request) => {
  // Verifica se o usuário está autenticado
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "O usuário deve estar autenticado.");
  }

  const { planId, price, userId, userEmail } = request.data;

  if (!planId || !price || !userId || !userEmail) {
    throw new HttpsError("invalid-argument", "Dados insuficientes para criar o checkout.");
  }

  const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || ""
  });

  const preference = new Preference(client);

  try {
    const result = await preference.create({
      body: {
        items: [
          {
            id: planId,
            title: `Decifra Premium - Plano ${planId}`,
            quantity: 1,
            unit_price: Number(price),
            currency_id: "BRL",
          }
        ],
        payer: {
          email: userEmail,
        },
        external_reference: userId, // Usamos o userId para identificar no webhook
        back_urls: {
          success: "https://decifra.app/pagamento-confirmado",
          failure: "https://decifra.app/loja",
          pending: "https://decifra.app/loja"
        },
        auto_return: "approved",
        notification_url: "https://southamerica-east1-decifra-premium.cloudfunctions.net/webhookMercadoPago",
      }
    });

    return {
      checkoutUrl: result.init_point,
      preferenceId: result.id
    };
  } catch (error) {
    console.error("Erro ao criar preferência no Mercado Pago:", error);
    throw new HttpsError("internal", "Erro ao processar checkout com Mercado Pago.");
  }
});
