/**
 * functions-client.ts
 *
 * Cliente do frontend para chamar as Firebase Cloud Functions via SDK.
 * Centraliza toda a comunicação com o backend — nenhuma API key fica no bundle.
 */
import { initializeApp, getApps } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";

// Configuração pública do Firebase (não são secrets — são safe para o frontend)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializa o app apenas uma vez (idempotente)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const functions = getFunctions(app, "southamerica-east1"); // Região mais próxima do Brasil

// ─────────────────────────────────────────────────────────────────────────────
// Tipos compartilhados com as Functions
// ─────────────────────────────────────────────────────────────────────────────

export interface UnifiedSearchResult {
  id: string;
  source: "tmdb" | "omdb";
  title: string;
  year: string;
  type: "movie" | "series";
  poster: string | null;
  imdbID?: string;
  tmdbID?: number;
  rating?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Callable handles (reutilizáveis — instanciados uma vez)
// ─────────────────────────────────────────────────────────────────────────────

const _analyzeWithGemini = httpsCallable<Record<string, unknown>, unknown>(
  functions,
  "analyzeWithGemini"
);

const _searchTMDB = httpsCallable<{ query: string }, UnifiedSearchResult[]>(
  functions,
  "searchTMDB"
);

const _searchOMDb = httpsCallable<{ query: string }, UnifiedSearchResult[]>(
  functions,
  "searchOMDb"
);

// ─────────────────────────────────────────────────────────────────────────────
// API Pública
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Chama a Cloud Function analyzeWithGemini.
 * O payload inclui todos os parâmetros necessários (sem a API key).
 */
export async function callAnalyzeWithGemini(
  payload: Record<string, unknown>
): Promise<unknown> {
  const result = await _analyzeWithGemini(payload);
  return result.data;
}

/**
 * Chama a Cloud Function searchTMDB.
 */
export async function callSearchTMDB(query: string): Promise<UnifiedSearchResult[]> {
  const result = await _searchTMDB({ query });
  return result.data;
}

/**
 * Chama a Cloud Function searchOMDb.
 */
export async function callSearchOMDb(query: string): Promise<UnifiedSearchResult[]> {
  const result = await _searchOMDb({ query });
  return result.data;
}
