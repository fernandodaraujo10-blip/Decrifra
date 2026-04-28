import * as functions from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

// Secret Manager — definido via: firebase functions:secrets:set OMDB_API_KEY
const OMDB_API_KEY = defineSecret("OMDB_API_KEY");

/**
 * Cloud Function: searchOMDb
 *
 * Recebe do frontend:
 *   - query: string
 *
 * Retorna: array de resultados normalizados do OMDb
 */
export const searchOMDb = functions.onCall(
  { secrets: [OMDB_API_KEY], cors: true },
  async (request) => {
    const { query } = request.data as { query: string };

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      throw new functions.HttpsError(
        "invalid-argument",
        "O campo 'query' é obrigatório e precisa ter ao menos 2 caracteres."
      );
    }

    const apiKey = OMDB_API_KEY.value();
    if (!apiKey) {
      throw new functions.HttpsError(
        "failed-precondition",
        "Chave OMDb não configurada no servidor."
      );
    }

    const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(query.trim())}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new functions.HttpsError(
        "internal",
        `Erro ao buscar no OMDb: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json() as { Search?: unknown[]; Error?: string };

    if (data["Error"]) {
      // OMDb retorna { Error: "Movie not found!" } com status 200 — trate como array vazio
      return [];
    }

    const results = (data.Search || []).map((item: unknown) => {
      const i = item as Record<string, unknown>;
      return {
        id: `omdb-${i["imdbID"]}`,
        imdbID: i["imdbID"] as string,
        source: "omdb" as const,
        title: i["Title"] as string,
        year: i["Year"] as string,
        type: i["Type"] === "series" ? "series" : "movie",
        poster: i["Poster"] !== "N/A" ? (i["Poster"] as string) : null,
        rating: i["imdbRating"] as string | undefined,
      };
    });

    return results;
  }
);
