
import { UnifiedSearchResult } from './types';

export function mergeResults(results: UnifiedSearchResult[]): UnifiedSearchResult[] {
    const map = new Map<string, UnifiedSearchResult>();

    results.forEach(item => {
        // Chave única baseada em Título + Ano para evitar duplicatas entre fontes diferentes
        const normalizedTitle = item.title.toLowerCase().trim();
        const key = `${normalizedTitle}-${item.year}`;

        if (!map.has(key)) {
            map.set(key, item);
        } else {
            // Se já existe, tenta enriquecer com dados que podem faltar
            const existing = map.get(key)!;
            if (!existing.poster && item.poster) existing.poster = item.poster;
            if (!existing.imdbID && item.imdbID) existing.imdbID = item.imdbID;
            if (!existing.tmdbID && item.tmdbID) existing.tmdbID = item.tmdbID;
            if (!existing.rating && item.rating) existing.rating = item.rating;
        }
    });

    return Array.from(map.values());
}
