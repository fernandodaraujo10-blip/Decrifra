import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

const omdbApiKey = defineSecret("OMDB_API_KEY");

export const omdbSearch = onCall(
  { secrets: [omdbApiKey], region: "southamerica-east1" },
  async (request) => {
    const query = request.data.query;
    if (!query) {
      throw new HttpsError("invalid-argument", "The function must be called with a 'query' argument.");
    }

    try {
      const apiKey = omdbApiKey.value();
      const res = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(query)}`);
      if (!res.ok) {
         throw new Error(`OMDb API error: ${res.status}`);
      }
      const data = await res.json();
      return data;
    } catch (error: any) {
      throw new HttpsError("internal", error.message);
    }
  }
);
