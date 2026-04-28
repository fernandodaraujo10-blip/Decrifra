"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tmdbSearch = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const tmdbApiKey = (0, params_1.defineSecret)("TMDB_API_KEY");
exports.tmdbSearch = (0, https_1.onCall)({ secrets: [tmdbApiKey], region: "southamerica-east1" }, async (request) => {
    const query = request.data.query;
    if (!query) {
        throw new https_1.HttpsError("invalid-argument", "The function must be called with a 'query' argument.");
    }
    try {
        const apiKey = tmdbApiKey.value();
        const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=pt-BR`);
        if (!res.ok) {
            throw new Error(`TMDB API error: ${res.status}`);
        }
        const data = await res.json();
        return data;
    }
    catch (error) {
        throw new https_1.HttpsError("internal", error.message);
    }
});
//# sourceMappingURL=tmdb.js.map