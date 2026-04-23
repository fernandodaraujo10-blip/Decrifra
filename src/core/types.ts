
export interface UnifiedSearchResult {
    id: string; // ID da fonte (ex: tmdb-123, omdb-tt123)
    source: 'tmdb' | 'omdb' | 'watchmode' | 'justwatch';
    title: string;
    year: string;
    type: 'movie' | 'series';
    poster: string | null;
    imdbID?: string;
    tmdbID?: number;
    rating?: string; // Nota IMDb ou TMDB
    streaming?: string[]; // Onde assistir
    similar?: string[];
}

export interface SearchCache {
    [query: string]: {
        timestamp: number;
        results: UnifiedSearchResult[];
    };
}
