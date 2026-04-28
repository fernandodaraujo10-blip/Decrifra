import { initializeApp } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions/v2";

// Define região padrão para todas as Cloud Functions
setGlobalOptions({ region: "southamerica-east1" });

initializeApp();

export { interpretMovie } from "./gemini";
export { tmdbSearch } from "./tmdb";
export { omdbSearch } from "./omdb";

// Pagamento — Mercado Pago
export { createCheckout } from "./createCheckout";
export { webhookMercadoPago } from "./webhookMercadoPago";
export { verifyPlan } from "./verifyPlan";
