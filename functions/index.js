const { onRequest } = require("firebase-functions/v2/https");
const { GoogleGenAI } = require("@google/genai");
const cors = require("cors")({ origin: true });

// A chave será lida das variáveis de ambiente/secrets do Firebase
// Para configurar: firebase functions:secrets:set GEMINI_API_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

exports.interpretContent = onRequest({ 
    secrets: ["GEMINI_API_KEY"],
    cors: true,
    invoker: "public" // Permite chamadas do frontend
}, async (req, res) => {
  return cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { title, mode, type, options } = req.body;

    if (!title) {
      return res.status(400).send("Missing title");
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;
      if (!apiKey) throw new Error("Chave de API não configurada no servidor.");

      const ai = new GoogleGenAI({ apiKey });
      
      let userPrompt = `Análise exegética ${mode || 'profundo'}: "${title}" (${type || 'filme'}).`;
      if (options?.analysisType) userPrompt += `\nFoco da análise: ${options.analysisType}`;
      if (options?.focusChip) userPrompt += `\nElemento de atenção: ${options.focusChip}`;
      if (options?.spoilerMode) userPrompt += `\nMODO SPOILER ATIVADO: Pode revelar reviravoltas e o final.`;

      // System instruction logic (simplificada para o proxy)
      const systemInstruction = `Você é um analista exegético premium. Retorne JSON estruturado.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });

      if (!response.text) throw new Error("Resposta vazia da IA");

      // Limpeza do JSON
      let cleanJson = response.text.trim();
      if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      res.status(200).json(JSON.parse(cleanJson));
    } catch (error) {
      console.error("Erro na Cloud Function:", error);
      res.status(500).json({ error: error.message });
    }
  });
});
