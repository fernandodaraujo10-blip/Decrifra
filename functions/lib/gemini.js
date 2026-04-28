"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpretMovie = void 0;
const genai_1 = require("@google/genai");
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const geminiApiKey = (0, params_1.defineSecret)("GEMINI_API_KEY");
const MODEL_CANDIDATES = [
    process.env.GEMINI_MODEL || "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.0-flash",
];
const getModeInstruction = (mode) => {
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
const SYSTEM_INSTRUCTION = (mode, type, options) => `Analista sênior de exegese ${options?.mediaCategory === 'books' ? 'literária' : options?.mediaCategory === 'music' ? 'musical' : 'cinematográfica'}. Gere um JSON (pt-BR).
${getModeInstruction(mode)}
Camada 9 (Síntese): Obra sustenta X, revelando Y. 3 argumentos.
Camada 10 (Visões): 10 pensadores (Paulo, Salomão, Dostoiévski, Freud, Maquiavel, Sócrates, Jung, Nietzsche, Sartre, Frankl). Nome, Eixo e Comentário.
Regras: Sem spoilers (1-5), arquétipos em personagens, conexões reais.
Contexto do pedido:
- categoria: ${options?.mediaCategory || "movies_series"}
- tipo de mídia: ${options?.mediaType || type}
- tipo de busca (livros): ${options?.searchType || "não informado"}
- profundidade (livros): ${options?.depthMode || "não informado"}
- modo spoiler: ${options?.spoilerMode ? "com spoiler liberado" : "sem spoiler (evitar revelações diretas do final em camadas iniciais)"}
- tipo de análise solicitado: ${options?.analysisType || "não informado"}
- foco rápido: ${options?.focusChip || "nenhum"}
- plano do usuário: ${options?.userPlan || "não informado"}
- id do usuário: ${options?.userId || "não informado"}.`;
const RESPONSE_SCHEMA = {
    type: genai_1.Type.OBJECT,
    properties: {
        info: {
            type: genai_1.Type.OBJECT,
            properties: {
                originalTitle: { type: genai_1.Type.STRING },
                year: { type: genai_1.Type.INTEGER },
                director: { type: genai_1.Type.STRING },
                genre: { type: genai_1.Type.STRING },
                duration: { type: genai_1.Type.STRING },
                country: { type: genai_1.Type.STRING },
                whereToWatch: { type: genai_1.Type.STRING },
                synopsis: { type: genai_1.Type.STRING },
            },
            required: ["originalTitle", "year", "director", "genre", "duration", "country", "whereToWatch", "synopsis"]
        },
        ratings: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    criterion: { type: genai_1.Type.STRING },
                    score: { type: genai_1.Type.NUMBER },
                    explanation: { type: genai_1.Type.STRING },
                },
                required: ["criterion", "score", "explanation"]
            }
        },
        characters: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    name: { type: genai_1.Type.STRING },
                    dramaticFunction: { type: genai_1.Type.STRING },
                    description: { type: genai_1.Type.STRING },
                },
                required: ["name", "dramaticFunction", "description"]
            }
        },
        whyWatch: { type: genai_1.Type.STRING },
        hiddenElements: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
        symbols: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    name: { type: genai_1.Type.STRING },
                    occurrence: { type: genai_1.Type.STRING },
                    representation: { type: genai_1.Type.STRING },
                    reflection: { type: genai_1.Type.STRING },
                },
                required: ["name", "occurrence", "representation", "reflection"]
            }
        },
        characterConflicts: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    name: { type: genai_1.Type.STRING },
                    centralDesire: { type: genai_1.Type.STRING },
                    hiddenFear: { type: genai_1.Type.STRING },
                    internalContradiction: { type: genai_1.Type.STRING },
                    symbolicRole: { type: genai_1.Type.STRING },
                },
                required: ["name", "centralDesire", "hiddenFear", "internalContradiction", "symbolicRole"]
            }
        },
        exegesis: {
            type: genai_1.Type.OBJECT,
            properties: {
                authorIntention: { type: genai_1.Type.STRING },
                nuances: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                centralThesis: { type: genai_1.Type.STRING },
            },
            required: ["authorIntention", "nuances", "centralThesis"]
        },
        lessons: {
            type: genai_1.Type.OBJECT,
            properties: {
                human: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                existential: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                reflectionQuestions: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
            },
            required: ["human", "existential", "reflectionQuestions"]
        },
        alternativeReadings: {
            type: genai_1.Type.OBJECT,
            properties: {
                psychological: { type: genai_1.Type.STRING },
                philosophical: { type: genai_1.Type.STRING },
                spiritual: { type: genai_1.Type.STRING },
            },
            required: ["psychological", "philosophical", "spiritual"]
        },
        spoilers: {
            type: genai_1.Type.OBJECT,
            properties: {
                keyScenes: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                twists: { type: genai_1.Type.STRING },
                finalExplained: { type: genai_1.Type.STRING },
                postEndingSymbols: { type: genai_1.Type.STRING },
            },
            required: ["keyScenes", "twists", "finalExplained", "postEndingSymbols"]
        },
        deepEssay: { type: genai_1.Type.STRING },
        similarMovies: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    title: { type: genai_1.Type.STRING },
                    reason: { type: genai_1.Type.STRING },
                    category: { type: genai_1.Type.STRING },
                },
                required: ["title", "reason", "category"]
            }
        },
        realLifeStory: {
            type: genai_1.Type.OBJECT,
            properties: {
                title: { type: genai_1.Type.STRING },
                description: { type: genai_1.Type.STRING },
                connection: { type: genai_1.Type.STRING },
            },
            required: ["title", "description", "connection"]
        },
        synthesis: {
            type: genai_1.Type.OBJECT,
            properties: {
                centralThesis: { type: genai_1.Type.STRING },
                arguments: {
                    type: genai_1.Type.ARRAY,
                    items: {
                        type: genai_1.Type.OBJECT,
                        properties: {
                            title: { type: genai_1.Type.STRING },
                            paragraph: { type: genai_1.Type.STRING },
                            connection: { type: genai_1.Type.STRING },
                        },
                        required: ["title", "paragraph", "connection"]
                    }
                },
                conclusion: { type: genai_1.Type.STRING },
            },
            required: ["centralThesis", "arguments", "conclusion"]
        },
        perspectives: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    name: { type: genai_1.Type.STRING },
                    axis: { type: genai_1.Type.STRING },
                    commentary: { type: genai_1.Type.STRING },
                },
                required: ["name", "axis", "commentary"]
            }
        }
    },
    required: ["info", "ratings", "characters", "whyWatch", "hiddenElements", "symbols", "characterConflicts", "exegesis", "lessons", "alternativeReadings", "spoilers", "deepEssay", "similarMovies", "realLifeStory", "synthesis", "perspectives"]
};
exports.interpretMovie = (0, https_1.onCall)({ secrets: [geminiApiKey], timeoutSeconds: 300, region: "southamerica-east1" }, async (request) => {
    const { movieName, mode = 'profundo', type = 'filme', options } = request.data;
    if (!movieName) {
        throw new https_1.HttpsError("invalid-argument", "movieName is required");
    }
    try {
        const apiKey = geminiApiKey.value();
        const ai = new genai_1.GoogleGenAI({ apiKey });
        console.time("GeminiAnalysis");
        let response = null;
        let lastError = null;
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
            }
            catch (error) {
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
    }
    catch (error) {
        console.error("DETALHES DO ERRO GEMINI:", error);
        throw new https_1.HttpsError("internal", error.message);
    }
});
//# sourceMappingURL=gemini.js.map