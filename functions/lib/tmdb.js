"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchTMDB = void 0;
const functions = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
// Secret Manager — definido via: firebase functions:secrets:set TMDB_API_KEY
const TMDB_API_KEY = (0, params_1.defineSecret)("TMDB_API_KEY");
/**
 * Cloud Function: searchTMDB
 *
 * Recebe do frontend:
 *   - query: string
 *
 * Retorna: array de resultados normalizados do TMDB
 */
exports.searchTMDB = functions.onCall({ secrets: [TMDB_API_KEY], cors: true }, async (request) => {
    const { query } = request.data;
    if (!query || typeof query !== "string" || query.trim().length < 2) {
        throw new functions.HttpsError("invalid-argument", "O campo 'query' é obrigatório e precisa ter ao menos 2 caracteres.");
    }
    const apiKey = TMDB_API_KEY.value();
    if (!apiKey) {
        throw new functions.HttpsError("failed-precondition", "Chave TMDB não configurada no servidor.");
    }
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query.trim())}&language=pt-BR`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new functions.HttpsError("internal", `Erro ao buscar no TMDB: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    const results = (data.results || []).map((item) => {
        const i = item;
        return {
            id: `tmdb-${i["id"]}`,
            tmdbID: i["id"],
            source: "tmdb",
            title: i["title"] || i["name"],
            year: (i["release_date"] || i["first_air_date"] || "").split("-")[0],
            type: i["media_type"] === "tv" ? "series" : "movie",
            poster: i["poster_path"] ? `https://image.tmdb.org/t/p/w200${i["poster_path"]}` : null,
            rating: typeof i["vote_average"] === "number"
                ? i["vote_average"].toFixed(1)
                : undefined,
        };
    });
    return results;
});
//# sourceMappingURL=tmdb.js.map