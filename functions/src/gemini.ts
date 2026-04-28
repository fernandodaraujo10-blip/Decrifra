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

const SYSTEM_INSTRUCTION = (mode: AnalysisMode, type: ContentType, options?: AnalysisContextOptions) => `Você é um Erudito em Exegese e Hermenêutica \${options?.mediaCategory === 'books' ? 'Literária' : options?.mediaCategory === 'music' ? 'Musical' : 'Cinematográfica'}.
Seu objetivo é produzir um CONTEÚDO MAGISTRAL, nota 10/10 em profundidade e estética literária.
Transforme cada análise em um mini-ensaio acadêmico-devocional de altíssimo nível.

TONALIDADE E ESTILO:
- Tom: Erudito, solene, mas com clareza moderna e inspiradora.
- Vocabulário: Rico, preciso e sofisticado.
- PROIBIDO: Respostas curtas, listas simples ou linguagem genérica.
- REGRA DE OURO: Se a resposta for superficial, você falhou. Cada campo deve transbordar substância.

ESTRUTURA DA CAMADA 10 (VISÕES - 10 PENSADORES):
Para cada pensador:
- **Voz do Pensador (Obrigatório)**: Escreva SEMPRE na **primeira pessoa do singular ("Eu")**. O pensador deve falar diretamente ao usuário.
- name: Nome completo do pensador.
- subtitle: O conceito central da análise (ex: "A ONTOLOGIA DO DESEJO").
- intro: 4 a 6 linhas densas situando a obra na minha filosofia (Em 1ª pessoa).
- interpretation: Minha exegese profunda e detalhada (5 a 8 linhas densas, Em 1ª pessoa).
- meaning: O impacto simbólico e metafísico que eu identifico (4 a 6 linhas, Em 1ª pessoa).
- application: Minha transposição prática e existencial para sua vida (4 a 6 linhas, Em 1ª pessoa).
- impactPhrase: Um **VERSÍCULO BÍBLICO** (se for Paulo ou Salomão) ou uma **CITAÇÃO ERUDITA** (para os outros) que eu escolheria para sintetizar minha visão sobre esta obra específica.
- source: Minha obra de referência ou o versículo citado.

REGRA DE PREENCHIMENTO: O conteúdo deve ser extenso, erudito e preencher completamente o card de resposta. Evite lacunas.

ESPECIFICAÇÕES POR CATEGORIA:
- SE FOR FILME/SÉRIE: Foque em simbolismos visuais, arquetípicos, montagem e o subtexto das cenas.
- SE FOR LIVRO: Foque na construção narrativa, na visão de mundo do autor, nos tropos literários e na riqueza do texto.
- SE FOR MÚSICA: Foque na poética lírica, na ressonância emocional, no impacto cultural e na "alma" por trás da composição.

Saída: JSON rigoroso (pt-BR). Sem spoilers (1-5).`;

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
    hiddenElements: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
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
        nuances: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        centralThesis: { type: Type.STRING },
      },
      required: ["authorIntention", "nuances", "centralThesis"]
    },
    lessons: {
      type: Type.OBJECT,
      properties: {
        human: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        existential: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        reflectionQuestions: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
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
        keyScenes: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
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
          const model = ai.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: RESPONSE_SCHEMA,
            },
            systemInstruction: SYSTEM_INSTRUCTION(mode as AnalysisMode, type as ContentType, options),
          });

          const prompt = \`Analise a obra: "\${movieName}". Categoria: \${type}. Foco: \${options?.analysisType || 'Geral'}. Mode: \${mode}.\`;
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          response = JSON.parse(text);
          break;
        } catch (err) {
          lastError = err;
          console.error(\`Erro com o modelo \${modelName}:\`, err);
        }
      }

      if (!response) {
        throw lastError;
      }

      console.timeEnd("GeminiAnalysis");
      return response as MovieAnalysis;
    } catch (error) {
      console.error("Erro no processamento Gemini:", error);
      throw new HttpsError("internal", "Erro ao processar análise exegética.");
    }
  }
);

export const tmdbSearch = onCall({ region: "southamerica-east1" }, async (request) => {
  return { results: [] };
});

export const omdbSearch = onCall({ region: "southamerica-east1" }, async (request) => {
  return { results: [] };
});

export const createCheckout = onCall({ region: "southamerica-east1" }, async (request) => {
  return { id: "mock-checkout-id" };
});

export const webhookMercadoPago = onCall({ region: "southamerica-east1" }, async (request) => {
  return { success: true };
});

export const verifyPlan = onCall({ region: "southamerica-east1" }, async (request) => {
  return { plan: "free" };
});
