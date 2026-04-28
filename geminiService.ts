
import { GoogleGenAI, Type } from "@google/genai";
import { MovieAnalysis } from "./types";

export type AnalysisMode = 'direto' | 'reflexivo' | 'profundo';
export type ContentType = 'filme' | 'serie' | 'livro' | 'autor' | 'musica';

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

const SYSTEM_INSTRUCTION = (mode: AnalysisMode, type: ContentType) => `Analista sênior de exegese cinematográfica. Gere um JSON (pt-BR).
${getModeInstruction(mode)}
Camada 9 (Síntese): Obra sustenta X, revelando Y. 3 argumentos.
Camada 10 (Visões): 10 pensadores (Paulo, Salomão, Dostoiévski, Freud, Maquiavel, Sócrates, Jung, Nietzsche, Sartre, Frankl). Nome, Eixo e Comentário.
Regras: Sem spoilers (1-5), arquétipos em personagens, conexões reais.`;

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
          axis: { type: Type.STRING },
          commentary: { type: Type.STRING },
        },
        required: ["name", "axis", "commentary"]
      }
    }
  },
  required: ["info", "ratings", "characters", "whyWatch", "hiddenElements", "symbols", "characterConflicts", "exegesis", "lessons", "alternativeReadings", "spoilers", "deepEssay", "similarMovies", "realLifeStory", "synthesis", "perspectives"]
};

export async function interpretMovie(
  movieName: string, 
  mode: AnalysisMode = 'profundo', 
  type: ContentType = 'filme',
  options: any = {}
): Promise<MovieAnalysis> {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyAhvAdIYYrmf8yb13K0nBGQenNAO5XLTmo";
    const ai = new GoogleGenAI({ apiKey });
    
    // Construção do prompt detalhado com base nas opções
    let userPrompt = `Análise exegética ${mode}: "${movieName}" (${type}).`;
    if (options.analysisType) userPrompt += `\nFoco da análise: ${options.analysisType}`;
    if (options.focusChip) userPrompt += `\nElemento de atenção: ${options.focusChip}`;
    if (options.spoilerMode) userPrompt += `\nMODO SPOILER ATIVADO: Pode revelar reviravoltas e o final.`;
    if (options.depthMode) userPrompt += `\nProfundidade solicitada: ${options.depthMode}`;

    console.time("GeminiAnalysis");
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }]
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION(mode, type),
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.7,
      }
    });
    console.timeEnd("GeminiAnalysis");

    if (!response.text) {
      throw new Error("Resposta vazia da IA");
    }

    // Limpeza robusta do JSON (remove backticks de markdown se presentes)
    let cleanJson = response.text.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("DETALHES DO ERRO GEMINI:", error);
    if (error instanceof Error) {
      console.error("Mensagem:", error.message);
    }
    throw error;
  }
}
