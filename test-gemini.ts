import { GoogleGenAI } from "@google/genai";

const apiKey = "AIzaSyAhvAdIYYrmf8yb13K0nBGQenNAO5XLTmo";
const ai = new GoogleGenAI({ apiKey });

async function test() {
  try {
    console.log("Tentando gerar conteúdo com gemini-2.5-flash...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: "Diga 'OK' em JSON." }] }],
      config: {
        responseMimeType: "application/json"
      }
    });
    console.log("Resposta da IA:", response.text);
  } catch (error) {
    console.error("Erro no teste real:", error);
  }
}

test();
