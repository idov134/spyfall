export const DEFAULT_PLACES = {
  en: [
    "Airport",
    "Bank",
    "Beach",
    "Casino",
    "Hospital",
    "Hotel",
    "School",
    "Restaurant",
    "Theater",
    "University",
  ],
  he: [
    "נמל תעופה",
    "בנק",
    "חוף",
    "קזינו",
    "בית חולים",
    "מלון",
    "בית ספר",
    "מסעדה",
    "תיאטרון",
    "אוניברסיטה",
  ],
};

export function getRandomDefaultPlace(lang) {
  const list = String(lang).toLowerCase().startsWith("he")
    ? DEFAULT_PLACES.he
    : DEFAULT_PLACES.en;
  return list[Math.floor(Math.random() * list.length)];
}
