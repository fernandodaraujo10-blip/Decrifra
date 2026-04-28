import { httpsCallable } from 'firebase/functions';
import { functions } from './src/firebase';
import { MovieAnalysis } from './types';

export type AnalysisMode = 'direto' | 'reflexivo' | 'profundo';
export type ContentType = 'filme' | 'serie' | 'livro' | 'musica';
export interface AnalysisContextOptions {
  mediaCategory?: 'movies_series' | 'books' | string;
  mediaType?: 'movie' | 'series' | string;
  searchType?: 'book' | 'author' | string;
  depthMode?: 'quick' | 'deep' | string;
  query?: string;
  mainFocus?: 'lyrics' | 'context' | 'emotion' | string;
  chipFocus?: string;
  spoilerMode?: boolean;
  analysisType?: string;
  focusChip?: string;
  userPlan?: string;
  userId?: string;
}

export async function interpretMovie(movieName: string, mode: AnalysisMode = 'profundo', type: ContentType = 'filme', options?: AnalysisContextOptions): Promise<MovieAnalysis> {
  const interpretMovieCall = httpsCallable(functions, 'interpretMovie');
  try {
    const result = await interpretMovieCall({
      movieName,
      mode,
      type,
      options
    });
    return result.data as MovieAnalysis;
  } catch (error) {
    console.error("Erro ao chamar a Cloud Function interpretMovie:", error);
    throw error;
  }
}
