"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookMercadoPago = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const firestore_1 = require("firebase-admin/firestore");
const mercadoPagoToken = (0, params_1.defineSecret)("MERCADO_PAGO_ACCESS_TOKEN");
exports.webhookMercadoPago = (0, https_1.onRequest)({
    region: "southamerica-east1",
    secrets: ["MERCADO_PAGO_ACCESS_TOKEN"],
}, async (req, res) => {
    // Mercado Pago exige 200 rápido — nunca retornar 4xx/5xx
    try {
        const { type, data } = req.body;
        if (type !== "payment" || !data?.id) {
            res.status(200).send("OK");
            return;
        }
        const paymentId = data.id;
        const accessToken = mercadoPagoToken.value();
        // Busca detalhes do pagamento na API do Mercado Pago
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!mpResponse.ok) {
            console.error(`Erro ao buscar pagamento ${paymentId}:`, await mpResponse.text());
            res.status(200).send("OK");
            return;
        }
        const payment = (await mpResponse.json());
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
        const db = (0, firestore_1.getFirestore)();
        const now = firestore_1.Timestamp.now();
        // Atualiza plano do usuário
        await db.doc(`users/${userId}`).set({
            plan: "premium",
            planActivatedAt: now,
        }, { merge: true });
        // Registra o pagamento no histórico
        await db.doc(`users/${userId}/payments/${paymentId}`).set({
            amount: payment.transaction_amount,
            status: payment.status,
            createdAt: now,
        });
        console.log(`✅ Plano premium ativado para usuário: ${userId}`);
    }
    catch (err) {
        console.error("Erro no webhook Mercado Pago:", err);
    }
    res.status(200).send("OK");
});
//# sourceMappingURL=webhookMercadoPago.js.map