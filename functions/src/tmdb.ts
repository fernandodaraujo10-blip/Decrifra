import * as functions from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

// Secret Manager — definido via: firebase functions:secrets:set TMDB_API_KEY
const TMDB_API_KEY = defineSecret("TMDB_API_KEY");

/**
 * Cloud Function: searchTMDB
 *
 * Recebe do frontend:
 *   - query: string
 *
 * Retorna: array de resultados normalizados do TMDB
 */
export const searchTMDB = functions.onCall(
  { secrets: [TMDB_API_KEY], cors: true },
  async (request) => {
    const { query } = request.data as { query: string };

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      throw new functions.HttpsError(
        "invalid-argument",
        "O campo 'query' é obrigatório e precisa ter ao menos 2 caracteres."
      );
    }

    const apiKey = TMDB_API_KEY.value();
    if (!apiKey) {
      throw new functions.HttpsError(
        "failed-precondition",
        "Chave TMDB não configurada no servidor."
      );
    }

    const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query.trim())}&language=pt-BR`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new functions.HttpsError(
        "internal",
        `Erro ao buscar no TMDB: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json() as { results?: unknown[] };

    const results = (data.results || []).map((item: unknown) => {
      const i = item as Record<string, unknown>;
      return {
        id: `tmdb-${i["id"]}`,
        tmdbID: i["id"],
        source: "tmdb" as const,
        title: (i["title"] as string) || (i["name"] as string),
        year: ((i["release_date"] as string) || (i["first_air_date"] as string) || "").split("-")[0],
        type: i["media_type"] === "tv" ? "series" : "movie",
        poster: i["poster_path"] ? `https://image.tmdb.org/t/p/w200${i["poster_path"]}` : null,
        rating: typeof i["vote_average"] === "number"
          ? (i["vote_average"] as number).toFixed(1)
          : undefined,
      };
    });

    return results;
  }
);
