import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

const tmdbApiKey = defineSecret("TMDB_API_KEY");

export const tmdbSearch = onCall(
  { secrets: [tmdbApiKey], region: "southamerica-east1" },
  async (request) => {
    const query = request.data.query;
    if (!query) {
      throw new HttpsError("invalid-argument", "The function must be called with a 'query' argument.");
    }

    try {
      const apiKey = tmdbApiKey.value();
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=pt-BR`);
      if (!res.ok) {
         throw new Error(`TMDB API error: ${res.status}`);
      }
      const data = await res.json();
      return data;
    } catch (error: any) {
      throw new HttpsError("internal", error.message);
    }
  }
);
