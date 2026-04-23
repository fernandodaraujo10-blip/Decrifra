
import { normalizeTMDB, normalizeOMDb } from './normalizer';
import { UnifiedSearchResult } from './types';

// Mock ou placeholders caso as chaves não existam no .env
const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY || "SEU_TMDB_KEY";
const OMDB_KEY = import.meta.env.VITE_OMDB_API_KEY || "SEU_OMDB_KEY";

export async function searchTMDB(query: string): Promise<UnifiedSearchResult[]> {
    if (!TMDB_KEY || TMDB_KEY === "SEU_TMDB_KEY") return [];
    try {
        const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=pt-BR`);
        const data = await res.json();
        return (data.results || []).map(normalizeTMDB);
    } catch (e) {
        console.error("TMDB Search Error:", e);
        return [];
    }
}

export async function searchOMDb(query: string): Promise<UnifiedSearchResult[]> {
    if (!OMDB_KEY || OMDB_KEY === "SEU_OMDB_KEY") return [];
    try {
        const res = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_KEY}&s=${encodeURIComponent(query)}`);
        const data = await res.json();
        return (data.Search || []).map(normalizeOMDb);
    } catch (e) {
        console.error("OMDb Search Error:", e);
        return [];
    }
}
