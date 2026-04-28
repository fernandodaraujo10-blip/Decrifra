"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPlan = exports.webhookMercadoPago = exports.createCheckout = exports.omdbSearch = exports.tmdbSearch = exports.interpretMovie = void 0;
const app_1 = require("firebase-admin/app");
const v2_1 = require("firebase-functions/v2");
// Define região padrão para todas as Cloud Functions
(0, v2_1.setGlobalOptions)({ region: "southamerica-east1" });
(0, app_1.initializeApp)();
var gemini_1 = require("./gemini");
Object.defineProperty(exports, "interpretMovie", { enumerable: true, get: function () { return gemini_1.interpretMovie; } });
var tmdb_1 = require("./tmdb");
Object.defineProperty(exports, "tmdbSearch", { enumerable: true, get: function () { return tmdb_1.tmdbSearch; } });
var omdb_1 = require("./omdb");
Object.defineProperty(exports, "omdbSearch", { enumerable: true, get: function () { return omdb_1.omdbSearch; } });
// Pagamento — Mercado Pago
var createCheckout_1 = require("./createCheckout");
Object.defineProperty(exports, "createCheckout", { enumerable: true, get: function () { return createCheckout_1.createCheckout; } });
var webhookMercadoPago_1 = require("./webhookMercadoPago");
Object.defineProperty(exports, "webhookMercadoPago", { enumerable: true, get: function () { return webhookMercadoPago_1.webhookMercadoPago; } });
var verifyPlan_1 = require("./verifyPlan");
Object.defineProperty(exports, "verifyPlan", { enumerable: true, get: function () { return verifyPlan_1.verifyPlan; } });
//# sourceMappingURL=index.js.map