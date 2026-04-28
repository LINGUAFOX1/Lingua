import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateFlashcardInsight(word: string, language: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a mnemonic and an example sentence for the word "${word}" in ${language}.`,
      config: {
        systemInstruction: `You are a creative language teacher. Return a short, fun mnemonic to remember the word, and a natural example sentence. Format cleanly. Do NOT use markdown code blocks, just regular text with bolding. Keep it very short.`,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI insight currently unavailable.";
  }
}

export async function analyzeText(text: string, language: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: text,
      config: {
        systemInstruction: `You are a world-class language professor. Explain the grammar, cultural context, and any natural phrasing alternatives for the provided text in ${language}. Use an encouraging, sophisticated tone. Format with clear headings and bullet points.`,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to analyze text. Please check your connection.");
  }
}
