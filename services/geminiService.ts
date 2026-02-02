
import { GoogleGenAI, Type } from "@google/genai";
import { Survey } from "../types";

export const generateWeeklySurvey = async (): Promise<Survey | null> => {
  try {
    const apiKey = process.env.API_KEY;
    
    // Evitar instanciar si no hay key, previniendo errores fatales
    if (!apiKey) {
      console.warn("Google Gemini API Key no encontrada en process.env.API_KEY");
      return null;
    }

    const ai = new GoogleGenAI({ apiKey });

    // Using gemini-3-flash-preview as per guidelines for general text tasks.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate a new engaging weekly survey question for professionals about technology trends or workplace renovation. Provide 4 distinct options.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    // response.text is a getter property, not a method.
    const data = JSON.parse(response.text || '{}');
    
    if (data.question && data.options) {
      return {
        id: `gen-${Date.now()}`,
        week: Math.floor(Math.random() * 52) + 1,
        isActive: true,
        category: 'Nacionales',
        question: data.question,
        options: data.options.map((opt: any, idx: number) => ({
          id: `opt-${idx}`,
          text: opt.text,
          votes: Math.floor(Math.random() * 50) // Simulating some initial interest
        }))
      };
    }
    return null;

  } catch (error) {
    console.error("Failed to generate survey with Gemini:", error);
    return null;
  }
};
