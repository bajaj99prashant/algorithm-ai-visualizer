import { GoogleGenAI } from "@google/genai";
import { AlgorithmType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const explainAlgorithm = async (algorithm: AlgorithmType): Promise<string> => {
  try {
    const prompt = `
      Explain the ${algorithm} algorithm clearly and concisely for a software engineering interview context.
      Include:
      1. Basic concept/intuition.
      2. Time Complexity (Best, Average, Worst).
      3. Space Complexity.
      4. A brief specific tip for remembering how it works.
      Format using simple Markdown headings and bullet points. Keep it under 250 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No explanation available.";
  } catch (error) {
    console.error("Error fetching explanation:", error);
    return "Failed to load explanation. Please check your API key.";
  }
};
