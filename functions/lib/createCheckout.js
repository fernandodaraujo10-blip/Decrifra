"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckout = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const mercadoPagoToken = (0, params_1.defineSecret)("MERCADO_PAGO_ACCESS_TOKEN");
const PRICES = {
    mensal: 14.90,
    trimestral: 37.90,
    semestral: 59.90,
    anual: 99.90,
};
const PLAN_LABELS = {
    mensal: "Decifra Premium — Mensal",
    trimestral: "Decifra Premium — Trimestral",
    semestral: "Decifra Premium — Semestral",
    anual: "Decifra Premium — Anual",
};
exports.createCheckout = (0, https_1.onCall)({
    region: "southamerica-east1",
    secrets: ["MERCADO_PAGO_ACCESS_TOKEN"],
}, async (request) => {
    // Verificação de autenticação
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Usuário não autenticado.");
    }
    const { planId } = request.data;
    if (!planId || !PRICES[planId]) {
        throw new https_1.HttpsError("invalid-argument", "planId inválido. Use: mensal, trimestral, semestral ou anual.");
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
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro ao criar preferência MP:", errorText);
        throw new https_1.HttpsError("internal", "Erro ao criar preferência de pagamento.");
    }
    const preference = await response.json();
    return { checkoutUrl: preference.init_point };
});
//# sourceMappingURL=createCheckout.js.map