
import { getCachedResults, setCachedResults } from './cache-advanced';
import { searchTMDB, searchOMDb } from './api-multisource';
import { mergeResults } from './merger';
import { UnifiedSearchResult } from './types';

import { canSearch, registerSearch } from './usage-free';

export async function runUnifiedSearch(query: string): Promise<UnifiedSearchResult[]> {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    if (!canSearch()) {
        console.warn("Limite atingido");
        return [];
    }

    // 1. Verificar Cache
    const cached = getCachedResults(q);
    if (cached) return cached;

    // 2. Busca Multi-Fonte Paralela
    const results = await Promise.allSettled([
        searchTMDB(q),
        searchOMDb(q)
    ]);

    const flatResults = results
        .filter((r): r is PromiseFulfilledResult<UnifiedSearchResult[]> => r.status === "fulfilled")
        .map(r => r.value)
        .flat();

    // 3. Merge e Deduplicação
    const finalResults = mergeResults(flatResults);

    // 4. Salvar Cache
    if (finalResults.length > 0) {
        setCachedResults(q, finalResults);
        registerSearch();
    }

    return finalResults.slice(0, 6); // Retornar top 6 para autocomplete
}
