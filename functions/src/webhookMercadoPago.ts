import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { MercadoPagoConfig, Payment } from "mercadopago";

// Inicializa o Admin se ainda não foi inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

export const webhookMercadoPago = onRequest({
  secrets: ["MERCADO_PAGO_ACCESS_TOKEN"],
  region: "southamerica-east1"
}, async (req, res) => {
  const { type, data } = req.body;

  // Mercado Pago envia notificações de diversos tipos, focamos em 'payment'
  if (type === "payment") {
    const paymentId = data.id;

    try {
      const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || ""
      });
      const payment = new Payment(client);
      
      const paymentData = await payment.get({ id: paymentId });

      if (paymentData.status === "approved") {
        const userId = paymentData.external_reference; // Recuperamos o userId que enviamos na criação
        
        if (userId) {
          // 1. Atualiza o plano do usuário para premium
          await admin.firestore().collection("users").doc(userId).set({
            plan: "premium",
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });

          // 2. Salva histórico de pagamento
          await admin.firestore().collection("users").doc(userId).collection("payments").doc(String(paymentId)).set({
            paymentId: paymentId,
            status: paymentData.status,
            amount: paymentData.transaction_amount,
            date_approved: paymentData.date_approved,
            raw_data: paymentData,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });

          console.log(`Pagamento aprovado e plano atualizado para o usuário: ${userId}`);
        }
      }
    } catch (error) {
      console.error("Erro ao processar webhook do Mercado Pago:", error);
      // Mesmo com erro, respondemos 200 ou 500 dependendo da política. 
      // Respondemos 500 aqui para o MP tentar novamente se for erro de rede/API.
      res.status(500).send("Erro interno");
      return;
    }
  }

  // Sempre responder 200 para o Mercado Pago parar de enviar a notificação
  res.status(200).send("OK");
});
