// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Translation resources. Every visible piece of interface text goes through
// this file (no hard-coded English strings inside gameplay components).
const resources = {
  en: {
    translation: {
      "Spyfall": "Spyfall",
      "How Would You Like to Play?": "How Would You Like to Play?",
      "Single Device": "Single Device",
      "Create Room": "Create Room",
      "Coming soon": "Coming soon",
      "Game Settings": "Game Settings",
      "Total players": "Total players",
      "Total spies": "Total spies",
      "Increase players": "Increase players",
      "Decrease players": "Decrease players",
      "Increase spies": "Increase spies",
      "Decrease spies": "Decrease spies",
      "Add Places": "Add Places",
      "Add": "Add",
      "Close": "Close",
      "Location name must be between 2 and 30 characters":
        "Location name must be between 2 and 30 characters",
      "This location already exists": "This location already exists",
      "Remove location: {{name}}": "Remove location: {{name}}",
      "Start Game": "Start Game",
      "You need at least {{min}} players": "You need at least {{min}} players",
      "You need at least {{min}} spy": "You need at least {{min}} spy",
      "The number of spies must be lower than the number of players":
        "The number of spies must be lower than the number of players",
      "Settings": "Settings",
      "Pass the device to Player {{number}}.": "Pass the device to Player {{number}}.",
      "Player {{current}} of {{total}}": "Player {{current}} of {{total}}",
      "Reveal card": "Reveal card",
      "Hide card": "Hide card",
      "You are the Spy.": "You are the Spy.",
      "Everyone has viewed their card": "Everyone has viewed their card",
      "Start discussion": "Start discussion",
      "New round": "New round",
      "404 Not Found / How did you get here?": "404 Not Found / How did you get here?",
      "Go Home": "Go Home",
    },
  },
  he: {
    translation: {
      "Spyfall": "הסוכן",
      "How Would You Like to Play?": "איך תרצו לשחק?",
      "Single Device": "מכשיר יחיד",
      "Create Room": "צור חדר",
      "Coming soon": "בקרוב",
      "Game Settings": "הגדרות משחק",
      "Total players": "כמות שחקנים",
      "Total spies": "כמות מרגלים",
      "Increase players": "הוסף שחקן",
      "Decrease players": "הסר שחקן",
      "Increase spies": "הוסף מרגל",
      "Decrease spies": "הסר מרגל",
      "Add Places": "הוסף מקומות",
      "Add": "הוסף",
      "Close": "סגור",
      "Location name must be between 2 and 30 characters":
        "שם המקום צריך להיות בין 2 ל-30 תווים",
      "This location already exists": "המקום הזה כבר קיים",
      "Remove location: {{name}}": "הסר מקום: {{name}}",
      "Start Game": "התחל משחק",
      "You need at least {{min}} players": "צריך לפחות {{min}} שחקנים",
      "You need at least {{min}} spy": "צריך לפחות {{min}} מרגל",
      "The number of spies must be lower than the number of players":
        "כמות המרגלים צריכה להיות קטנה ממספר השחקנים",
      "Settings": "הגדרות",
      "Pass the device to Player {{number}}.": "העבר את המכשיר לשחקן {{number}}",
      "Player {{current}} of {{total}}": "שחקן {{current}} מתוך {{total}}",
      "Reveal card": "חשוף קלף",
      "Hide card": "הסתר קלף",
      "You are the Spy.": "אתה המרגל",
      "Everyone has viewed their card": "כולם ראו את הקלף שלהם",
      "Start discussion": "התחילו בדיון",
      "New round": "סיבוב חדש",
      "404 Not Found / How did you get here?": "שגיאת 404 / איך הגעת לפה?",
      "Go Home": "חזור לדף הבית",
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    // Persist the player's chosen language across refreshes.
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false, // React already escapes values.
    },
  });

export default i18n;
