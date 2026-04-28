import { GoogleGenAI, Type } from "@google/genai";
import { MovieAnalysis } from "./types";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

const geminiApiKey = defineSecret("GEMINI_API_KEY");
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

const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL || "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-latest",
];

const getModeInstruction = (mode: AnalysisMode) => {
  switch (mode) {
    case 'direto':
      return "ESTILO: Direto e Reto. Seja conciso, objetivo e evite floreios poéticos. Foque nos fatos e em interpretações rápidas.";
    case 'reflexivo':
      return "ESTILO: Reflexivo. Equilibre análise técnica com sensibilidade. Use metáforas compreensíveis e foque na experiência emocional do espectador.";
    case 'profundo':
    default:
      return "ESTILO: Profundo. Use um vocabulário acadêmico, análise exegética densa, ensaios longos e conexões filosóficas complexas.";
  }
};

const SYSTEM_INSTRUCTION = (mode: AnalysisMode, type: ContentType, options?: AnalysisContextOptions) => `Analista sênior de exegese ${options?.mediaCategory === 'books' ? 'literária' : options?.mediaCategory === 'music' ? 'musical' : 'cinematográfica'}.
Seu objetivo é transformar a análise em um mini-devocional profundo, misturando filosofia aplicada e clareza moderna.
Gere um JSON (pt-BR).

ESTILO DE ESCRITA:
- Tom: Reflexivo, autoritativo e inspirador.
- Linguagem: Clara, profunda e envolvente.
- NUNCA use "em processamento", "texto genérico" ou "fonte desconhecida".

ESTRUTURA DA CAMADA 10 (VISÕES):
Gere 10 pensadores fixos (Paulo, Salomão, Dostoiévski, Freud, Maquiavel, Sócrates, Jung, Nietzsche, Sartre, Frankl). Para cada um:
- name: Nome do pensador.
- subtitle: Eixo central (caixa alta).
- intro: Parágrafo introdutório analítico.
- interpretation: Explicar conceito central + contexto espiritual/filosófico (4 a 6 linhas desenvolvidas).
- meaning: Impacto simbólico e tradução universal (3 a 5 linhas objetivas).
- application: Prático e pessoal. Como aplicar na vida real (3 a 5 linhas).
- impactPhrase: Frase forte, memorável e autoral (estilo citação profunda).
- source: Referência bibliográfica ou bíblica (deixe vazio se não houver, NUNCA use "desconhecida").

REGRAS DE QUALIDADE:
- Entrega conteúdo FINALIZADO e PROFUNDO.
- Mantenha coerência teológica e filosófica.
- Sem spoilers (1-5).`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    info: {
      type: Type.OBJECT,
      properties: {
        originalTitle: { type: Type.STRING },
        year: { type: Type.INTEGER },
        director: { type: Type.STRING },
        genre: { type: Type.STRING },
        duration: { type: Type.STRING },
        country: { type: Type.STRING },
        whereToWatch: { type: Type.STRING },
        synopsis: { type: Type.STRING },
      },
      required: ["originalTitle", "year", "director", "genre", "duration", "country", "whereToWatch", "synopsis"]
    },
    ratings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          criterion: { type: Type.STRING },
          score: { type: Type.NUMBER },
          explanation: { type: Type.STRING },
        },
        required: ["criterion", "score", "explanation"]
      }
    },
    characters: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          dramaticFunction: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["name", "dramaticFunction", "description"]
      }
    },
    whyWatch: { type: Type.STRING },
    hiddenElements: { type: Type.ARRAY, items: { type: Type.STRING } },
    symbols: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          occurrence: { type: Type.STRING },
          representation: { type: Type.STRING },
          reflection: { type: Type.STRING },
        },
        required: ["name", "occurrence", "representation", "reflection"]
      }
    },
    characterConflicts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          centralDesire: { type: Type.STRING },
          hiddenFear: { type: Type.STRING },
          internalContradiction: { type: Type.STRING },
          symbolicRole: { type: Type.STRING },
        },
        required: ["name", "centralDesire", "hiddenFear", "internalContradiction", "symbolicRole"]
      }
    },
    exegesis: {
      type: Type.OBJECT,
      properties: {
        authorIntention: { type: Type.STRING },
        nuances: { type: Type.ARRAY, items: { type: Type.STRING } },
        centralThesis: { type: Type.STRING },
      },
      required: ["authorIntention", "nuances", "centralThesis"]
    },
    lessons: {
      type: Type.OBJECT,
      properties: {
        human: { type: Type.ARRAY, items: { type: Type.STRING } },
        existential: { type: Type.ARRAY, items: { type: Type.STRING } },
        reflectionQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["human", "existential", "reflectionQuestions"]
    },
    alternativeReadings: {
      type: Type.OBJECT,
      properties: {
        psychological: { type: Type.STRING },
        philosophical: { type: Type.STRING },
        spiritual: { type: Type.STRING },
      },
      required: ["psychological", "philosophical", "spiritual"]
    },
    spoilers: {
      type: Type.OBJECT,
      properties: {
        keyScenes: { type: Type.ARRAY, items: { type: Type.STRING } },
        twists: { type: Type.STRING },
        finalExplained: { type: Type.STRING },
        postEndingSymbols: { type: Type.STRING },
      },
      required: ["keyScenes", "twists", "finalExplained", "postEndingSymbols"]
    },
    deepEssay: { type: Type.STRING },
    similarMovies: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          reason: { type: Type.STRING },
          category: { type: Type.STRING },
        },
        required: ["title", "reason", "category"]
      }
    },
    realLifeStory: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        connection: { type: Type.STRING },
      },
      required: ["title", "description", "connection"]
    },
    synthesis: {
      type: Type.OBJECT,
      properties: {
        centralThesis: { type: Type.STRING },
        arguments: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              paragraph: { type: Type.STRING },
              connection: { type: Type.STRING },
            },
            required: ["title", "paragraph", "connection"]
          }
        },
        conclusion: { type: Type.STRING },
      },
      required: ["centralThesis", "arguments", "conclusion"]
    },
    perspectives: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          subtitle: { type: Type.STRING },
          intro: { type: Type.STRING },
          interpretation: { type: Type.STRING },
          meaning: { type: Type.STRING },
          application: { type: Type.STRING },
          impactPhrase: { type: Type.STRING },
          source: { type: Type.STRING },
        },
        required: ["name", "subtitle", "intro", "interpretation", "meaning", "application", "impactPhrase", "source"]
      }
    }
  },
  required: ["info", "ratings", "characters", "whyWatch", "hiddenElements", "symbols", "characterConflicts", "exegesis", "lessons", "alternativeReadings", "spoilers", "deepEssay", "similarMovies", "realLifeStory", "synthesis", "perspectives"]
};

export const interpretMovie = onCall(
  { secrets: [geminiApiKey], timeoutSeconds: 540, region: "southamerica-east1", memory: "1GiB" },
  async (request): Promise<MovieAnalysis> => {
    const { movieName, mode = 'profundo', type = 'filme', options } = request.data;
    if (!movieName) {
      throw new HttpsError("invalid-argument", "movieName is required");
    }

    try {
      const apiKey = geminiApiKey.value();
      const ai = new GoogleGenAI({ apiKey });
      console.time("GeminiAnalysis");
      let response: any = null;
      let lastError: unknown = null;

      for (const modelName of MODEL_CANDIDATES) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: `Análise exegética ${mode}: "${movieName}" (${type}). Contexto extra: ${JSON.stringify(options || {})}`,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION(mode, type, options),
              responseMimeType: "application/json",
              responseSchema: RESPONSE_SCHEMA,
            }
          });
          break;
        } catch (error) {
          lastError = error;
          console.warn(`Falha ao usar modelo ${modelName}. Tentando próximo fallback...`);
        }
      }

      if (!response) {
        throw lastError instanceof Error ? lastError : new Error("Falha ao gerar conteúdo com todos os modelos configurados.");
      }
      console.timeEnd("GeminiAnalysis");

      if (!response.text) {
        throw new Error("Resposta vazia da IA");
      }

      return JSON.parse(response.text);
    } catch (error: any) {
      console.error("DETALHES DO ERRO GEMINI:", error);
      throw new HttpsError("internal", error.message);
    }
  }
);
