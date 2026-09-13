// Curated, built-in location catalog used to deal the secret location for a
// round. Locations are broad, familiar categories (not specific businesses
// or addresses) so that any group of players can reason about them.
//
// Custom, user-added locations are stored separately (see the settings
// Redux slice) and are converted into this same shape via `toLocationObject`
// before being merged into the selection pool. This file never changes at
// runtime.

export const BUILT_IN_LOCATIONS = [
  { id: "airport", category: "travel", names: { en: "Airport", he: "נמל תעופה" } },
  { id: "hospital", category: "services", names: { en: "Hospital", he: "בית חולים" } },
  { id: "school", category: "education", names: { en: "School", he: "בית ספר" } },
  { id: "university", category: "education", names: { en: "University", he: "אוניברסיטה" } },
  { id: "restaurant", category: "food", names: { en: "Restaurant", he: "מסעדה" } },
  { id: "pizza-place", category: "food", names: { en: "Pizza Place", he: "פיצרייה" } },
  { id: "coffee-shop", category: "food", names: { en: "Coffee Shop", he: "בית קפה" } },
  { id: "supermarket", category: "shopping", names: { en: "Supermarket", he: "סופרמרקט" } },
  { id: "beach", category: "leisure", names: { en: "Beach", he: "חוף" } },
  { id: "hotel", category: "travel", names: { en: "Hotel", he: "מלון" } },
  { id: "bank", category: "services", names: { en: "Bank", he: "בנק" } },
  { id: "police-station", category: "services", names: { en: "Police Station", he: "תחנת משטרה" } },
  { id: "fire-station", category: "services", names: { en: "Fire Station", he: "תחנת כיבוי אש" } },
  { id: "gym", category: "leisure", names: { en: "Gym", he: "חדר כושר" } },
  { id: "movie-theater", category: "entertainment", names: { en: "Movie Theater", he: "קולנוע" } },
  { id: "museum", category: "entertainment", names: { en: "Museum", he: "מוזיאון" } },
  { id: "library", category: "education", names: { en: "Library", he: "ספרייה" } },
  { id: "train-station", category: "travel", names: { en: "Train Station", he: "תחנת רכבת" } },
  { id: "bus-station", category: "travel", names: { en: "Bus Station", he: "תחנת אוטובוס" } },
  { id: "amusement-park", category: "entertainment", names: { en: "Amusement Park", he: "פארק שעשועים" } },
  { id: "zoo", category: "entertainment", names: { en: "Zoo", he: "גן חיות" } },
  { id: "stadium", category: "entertainment", names: { en: "Stadium", he: "אצטדיון" } },
  { id: "office", category: "work", names: { en: "Office", he: "משרד" } },
  { id: "factory", category: "work", names: { en: "Factory", he: "מפעל" } },
  { id: "farm", category: "work", names: { en: "Farm", he: "חווה" } },
  { id: "prison", category: "services", names: { en: "Prison", he: "כלא" } },
  { id: "casino", category: "entertainment", names: { en: "Casino", he: "קזינו" } },
  { id: "shopping-mall", category: "shopping", names: { en: "Shopping Mall", he: "קניון" } },
  { id: "barbershop", category: "services", names: { en: "Barbershop", he: "מספרה" } },
  { id: "wedding-hall", category: "entertainment", names: { en: "Wedding Hall", he: "אולם חתונות" } },
  { id: "military-base", category: "special", names: { en: "Military Base", he: "בסיס צבאי" } },
  { id: "spaceship", category: "special", names: { en: "Spaceship", he: "חללית" } },
  { id: "cruise-ship", category: "travel", names: { en: "Cruise Ship", he: "אוניית תענוגות" } },
];

const DEFAULT_LANGUAGE = "en";

function normalizeLanguage(lang) {
  return String(lang || "").toLowerCase().startsWith("he") ? "he" : DEFAULT_LANGUAGE;
}

/**
 * Resolve the display name of a location for a given language, falling back
 * to English (and then to a raw `name` field for legacy/custom shapes).
 */
export function getLocationName(location, lang) {
  if (!location) return "";
  const language = normalizeLanguage(lang);
  if (location.names) {
    return location.names[language] || location.names[DEFAULT_LANGUAGE] || "";
  }
  return location.name || "";
}

/**
 * Convert a user-added custom location record (`{ id, name }`, as stored in
 * Redux) into the same `{ id, names }` shape used by the built-in catalog,
 * so both can be merged into a single selection pool. Custom locations only
 * have one name (whatever the player typed), used for every language.
 */
export function toLocationObject(customLocation) {
  return {
    id: customLocation.id,
    category: "custom",
    isCustom: true,
    names: { en: customLocation.name, he: customLocation.name },
  };
}
