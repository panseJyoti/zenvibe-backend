import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getAISuggestion = async (mood) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Suggest 1-2 short, practical activities for someone who is feeling "${mood}". Be brief and helpful.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text.trim();
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "Sorry, couldn't generate a suggestion right now.";
  }
};

export default getAISuggestion;
