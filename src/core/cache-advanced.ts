
import { UnifiedSearchResult, SearchCache } from './types';

const CACHE_KEY = 'cine_search_v3_cache';
const CACHE_TTL = 1000 * 60 * 60; // 1 hora

export function getCachedResults(query: string): UnifiedSearchResult[] | null {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const cache: SearchCache = JSON.parse(raw);
    const entry = cache[query.toLowerCase().trim()];

    if (entry && (Date.now() - entry.timestamp < CACHE_TTL)) {
        return entry.results;
    }

    return null;
}

export function setCachedResults(query: string, results: UnifiedSearchResult[]): void {
    const raw = localStorage.getItem(CACHE_KEY);
    const cache: SearchCache = raw ? JSON.parse(raw) : {};

    cache[query.toLowerCase().trim()] = {
        timestamp: Date.now(),
        results
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}
