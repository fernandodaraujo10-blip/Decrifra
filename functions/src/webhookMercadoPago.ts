import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import type { Request, Response } from "express";

const mercadoPagoToken = defineSecret("MERCADO_PAGO_ACCESS_TOKEN");

export const webhookMercadoPago = onRequest(
  {
    region: "southamerica-east1",
    secrets: ["MERCADO_PAGO_ACCESS_TOKEN"],
  },
  async (req: Request, res: Response) => {
    // Mercado Pago exige 200 rápido — nunca retornar 4xx/5xx
    try {
      const { type, data } = req.body as {
        type: string;
        data?: { id?: string };
      };

      if (type !== "payment" || !data?.id) {
        res.status(200).send("OK");
        return;
      }

      const paymentId = data.id;
      const accessToken = mercadoPagoToken.value();

      // Busca detalhes do pagamento na API do Mercado Pago
      const mpResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!mpResponse.ok) {
        console.error(
          `Erro ao buscar pagamento ${paymentId}:`,
          await mpResponse.text()
        );
        res.status(200).send("OK");
        return;
      }

      const payment = (await mpResponse.json()) as {
        status: string;
        external_reference: string;
        transaction_amount: number;
        date_created: string;
      };

      if (payment.status !== "approved") {
        res.status(200).send("OK");
        return;
      }

      const userId = payment.external_reference;

      if (!userId) {
        console.warn("Pagamento aprovado sem external_reference:", paymentId);
        res.status(200).send("OK");
        return;
      }

      const db = getFirestore();
      const now = Timestamp.now();

      // Atualiza plano do usuário
      await db.doc(`users/${userId}`).set(
        {
          plan: "premium",
          planActivatedAt: now,
        },
        { merge: true }
      );

      // Registra o pagamento no histórico
      await db.doc(`users/${userId}/payments/${paymentId}`).set({
        amount: payment.transaction_amount,
        status: payment.status,
        createdAt: now,
      });

      console.log(`✅ Plano premium ativado para usuário: ${userId}`);
    } catch (err) {
      console.error("Erro no webhook Mercado Pago:", err);
    }

    res.status(200).send("OK");
  }
);
