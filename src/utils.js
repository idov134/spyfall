export default function isEmptyArray(array) {
  return !Array.isArray(array) || array.length === 0;
}

export function addItem(arr, item) {
  return [...arr, item];
}

export function removeItem(arr, itemIndex) {
  return [...arr.slice(0, itemIndex), ...arr.slice(itemIndex + 1)];
}

export function isValidPlace(place) {
  if (typeof place !== "string") return false;
  const trimmed = place.trim();
  return trimmed.length >= 2 && trimmed.length <= 30;
}