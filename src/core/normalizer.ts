
import { UnifiedSearchResult } from './types';

export function normalizeTMDB(item: any): UnifiedSearchResult {
    return {
        id: `tmdb-${item.id}`,
        tmdbID: item.id,
        source: 'tmdb',
        title: item.title || item.name,
        year: (item.release_date || item.first_air_date || '').split('-')[0],
        type: item.media_type === 'tv' ? 'series' : 'movie',
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : null,
        rating: item.vote_average?.toFixed(1)
    };
}

export function normalizeOMDb(item: any): UnifiedSearchResult {
    return {
        id: `omdb-${item.imdbID}`,
        imdbID: item.imdbID,
        source: 'omdb',
        title: item.Title,
        year: item.Year,
        type: item.Type === 'series' ? 'series' : 'movie',
        poster: item.Poster !== 'N/A' ? item.Poster : null,
        rating: item.imdbRating
    };
}
