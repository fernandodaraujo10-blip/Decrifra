"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchOMDb = void 0;
const functions = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
// Secret Manager — definido via: firebase functions:secrets:set OMDB_API_KEY
const OMDB_API_KEY = (0, params_1.defineSecret)("OMDB_API_KEY");
/**
 * Cloud Function: searchOMDb
 *
 * Recebe do frontend:
 *   - query: string
 *
 * Retorna: array de resultados normalizados do OMDb
 */
exports.searchOMDb = functions.onCall({ secrets: [OMDB_API_KEY], cors: true }, async (request) => {
    const { query } = request.data;
    if (!query || typeof query !== "string" || query.trim().length < 2) {
        throw new functions.HttpsError("invalid-argument", "O campo 'query' é obrigatório e precisa ter ao menos 2 caracteres.");
    }
    const apiKey = OMDB_API_KEY.value();
    if (!apiKey) {
        throw new functions.HttpsError("failed-precondition", "Chave OMDb não configurada no servidor.");
    }
    const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(query.trim())}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new functions.HttpsError("internal", `Erro ao buscar no OMDb: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    if (data["Error"]) {
        // OMDb retorna { Error: "Movie not found!" } com status 200 — trate como array vazio
        return [];
    }
    const results = (data.Search || []).map((item) => {
        const i = item;
        return {
            id: `omdb-${i["imdbID"]}`,
            imdbID: i["imdbID"],
            source: "omdb",
            title: i["Title"],
            year: i["Year"],
            type: i["Type"] === "series" ? "series" : "movie",
            poster: i["Poster"] !== "N/A" ? i["Poster"] : null,
            rating: i["imdbRating"],
        };
    });
    return results;
});
//# sourceMappingURL=omdb.js.map