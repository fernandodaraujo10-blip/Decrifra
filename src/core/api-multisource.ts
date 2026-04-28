import { normalizeTMDB, normalizeOMDb } from './normalizer';
import { UnifiedSearchResult } from './types';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

export async function searchTMDB(query: string): Promise<UnifiedSearchResult[]> {
    if (!query) return [];
    try {
        const tmdbSearchCall = httpsCallable(functions, 'tmdbSearch');
        const res = await tmdbSearchCall({ query });
        const data = res.data as any;
        return (data.results || []).map(normalizeTMDB);
    } catch (e) {
        console.error("TMDB Search Error:", e);
        return [];
    }
}

export async function searchOMDb(query: string): Promise<UnifiedSearchResult[]> {
    if (!query) return [];
    try {
        const omdbSearchCall = httpsCallable(functions, 'omdbSearch');
        const res = await omdbSearchCall({ query });
        const data = res.data as any;
        return (data.Search || []).map(normalizeOMDb);
    } catch (e) {
        console.error("OMDb Search Error:", e);
        return [];
    }
}
