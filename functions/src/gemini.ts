import * as functions from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";
import { GoogleGenAI } from "@google/genai";

// Secret Manager — definido via: firebase functions:secrets:set GEMINI_API_KEY
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash",
];

/**
 * Cloud Function: analyzeWithGemini
 *
 * Recebe do frontend:
 *   - movieName: string
 *   - mode: 'direto' | 'reflexivo' | 'profundo'
 *   - type: 'filme' | 'serie' | 'livro' | 'musica'
 *   - options: AnalysisContextOptions
 *   - systemInstruction: string  (montado no frontend, sem chave)
 *   - responseSchema: object
 *
 * Retorna: MovieAnalysis (JSON)
 */
export const analyzeWithGemini = functions.onCall(
  { secrets: [GEMINI_API_KEY], cors: true },
  async (request) => {
    const { movieName, mode, type, options, systemInstruction, responseSchema } =
      request.data as {
        movieName: string;
        mode: string;
        type: string;
        options: Record<string, unknown>;
        systemInstruction: string;
        responseSchema: Record<string, unknown>;
      };

    if (!movieName || typeof movieName !== "string") {
      throw new functions.HttpsError(
        "invalid-argument",
        "O campo 'movieName' é obrigatório."
      );
    }

    const apiKey = GEMINI_API_KEY.value();
    if (!apiKey) {
      throw new functions.HttpsError(
        "failed-precondition",
        "Chave Gemini não configurada no servidor."
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    let response: { text: string } | null = null;
    let lastError: unknown = null;

    for (const modelName of MODEL_CANDIDATES) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: `Análise exegética ${mode}: "${movieName}" (${type}). Contexto extra: ${JSON.stringify(options || {})}`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
          },
        }) as { text: string };
        break;
      } catch (err) {
        lastError = err;
        logger.warn(
          `Falha ao usar modelo ${modelName}. Tentando próximo...`
        );
      }
    }

    if (!response) {
      throw new functions.HttpsError(
        "internal",
        lastError instanceof Error
          ? lastError.message
          : "Falha ao gerar conteúdo com todos os modelos."
      );
    }

    if (!response.text) {
      throw new functions.HttpsError("internal", "Resposta vazia da IA.");
    }

    return JSON.parse(response.text);
  }
);
