// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Translation resources
const resources = {
  he: {
    translation: {
      "Spyfall": "הסוכן",
      "How Would You Like to Play?": "איך תרצו לשחק?",
      "Single Device":"מכשיר יחיד",
      "Create Room":"צור חדר",
      "Game Settings": "הגדרות משחק",
      "Total players": "כמות שחקנים",
      "Total spies": "כמות סוכנים",
      "Start Game": "התחל משחק",
      "Would you find the Spy?":"תצליחו למצוא את הסוכן?",
      "Player":"שחקן",
      "Start New Game":"התחל משחק חדש",
      "You're The Spy": "את/ה הסוכנ/ת",
      "Loading...":"טוען...",
      "404 Not Found / How did you get here?": "שגיאת 404 / איך הגעת לפה?",
      "Go Home": "חזור לדף הבית",
      "Add Places": "הוסף מקומות",
      "Add": "הוסף",
      "Coming soon": "בקרוב",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // React already does escaping
    }
  });

export default i18n;
