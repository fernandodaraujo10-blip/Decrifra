"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.omdbSearch = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const omdbApiKey = (0, params_1.defineSecret)("OMDB_API_KEY");
exports.omdbSearch = (0, https_1.onCall)({ secrets: [omdbApiKey], region: "southamerica-east1" }, async (request) => {
    const query = request.data.query;
    if (!query) {
        throw new https_1.HttpsError("invalid-argument", "The function must be called with a 'query' argument.");
    }
    try {
        const apiKey = omdbApiKey.value();
        const res = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(query)}`);
        if (!res.ok) {
            throw new Error(`OMDb API error: ${res.status}`);
        }
        const data = await res.json();
        return data;
    }
    catch (error) {
        throw new https_1.HttpsError("internal", error.message);
    }
});
//# sourceMappingURL=omdb.js.map