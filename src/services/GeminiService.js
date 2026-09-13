import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRandomDefaultPlace } from "../data/places";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const EN_PROMPT = process.env.REACT_APP_GEMINI_PROMPT_EN;
const HE_PROMPT = process.env.REACT_APP_GEMINI_PROMPT_HE;

const isHebrew = (lang) => String(lang).toLowerCase().startsWith("he");

const getPlace = async (lang) => {
  const fallback = getRandomDefaultPlace(lang);

  if (!API_KEY) {
    return fallback;
  }

  const prompt = isHebrew(lang) ? HE_PROMPT : EN_PROMPT;
  if (!prompt) {
    return fallback;
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = (await result.response).text()?.trim();
    return text || fallback;
  } catch (error) {
    console.error("Error generating place from Gemini:", error.message);
    return fallback;
  }
};

export default getPlace;
