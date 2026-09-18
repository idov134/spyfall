// Pure, framework-free game rules for Spyfall-style role/location dealing.
// Nothing in this file touches React, Redux, or the DOM, so it can be
// tested in isolation and reused by any UI.

import { getLocationName } from "../data/locations";

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 16;
export const MIN_SPIES = 1;

/** Bounds + default for the player-configurable discussion timer, in minutes. */
export const MIN_DISCUSSION_MINUTES = 1;
export const MAX_DISCUSSION_MINUTES = 30;
export const DEFAULT_DISCUSSION_MINUTES = 8;

/**
 * Unbiased Fisher-Yates shuffle. Returns a new array; does not mutate the
 * input. `rng` is injectable so tests can be deterministic.
 */
export function shuffle(items, rng = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Centralized validation for player/spy counts. Returns translation keys
 * (with optional interpolation params) rather than final strings, so the UI
 * decides how to display them.
 */
export function validateSettings({ players, spies }) {
  const errors = [];

  if (!Number.isInteger(players) || players < MIN_PLAYERS) {
    errors.push({ key: "You need at least {{min}} players", params: { min: MIN_PLAYERS } });
  }

  if (!Number.isInteger(spies) || spies < MIN_SPIES) {
    errors.push({ key: "You need at least {{min}} spy", params: { min: MIN_SPIES } });
  }

  if (
    Number.isInteger(players) &&
    Number.isInteger(spies) &&
    spies >= players &&
    players >= MIN_PLAYERS
  ) {
    errors.push({ key: "The number of spies must be lower than the number of players" });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Randomly assigns exactly `spies` "spy" roles among `players` players and
 * "player" roles to everyone else, using an unbiased shuffle so the result
 * is never tied to UI order. Throws if the settings are invalid.
 */
export function assignRoles({ players, spies, rng = Math.random }) {
  const { valid, errors } = validateSettings({ players, spies });
  if (!valid) {
    throw new Error(errors.map((error) => error.key).join("; "));
  }

  const roles = Array.from({ length: players }, (_, index) => (index < spies ? "spy" : "player"));
  return shuffle(roles, rng);
}

export function normalizeLocationName(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase();
}

/**
 * Picks one location at random from the combined built-in + custom pool.
 * Locations whose id is in `excludeIds` are avoided when possible (used to
 * stop the same location from repeating round after round); if every
 * location is excluded, the exclusion is dropped rather than returning
 * nothing.
 */
export function pickLocation({ builtIn = [], custom = [], excludeIds = [], rng = Math.random }) {
  const pool = [...builtIn, ...custom];
  if (pool.length === 0) return null;

  const candidates = pool.filter((location) => !excludeIds.includes(location.id));
  const finalPool = candidates.length > 0 ? candidates : pool;

  const index = Math.floor(rng() * finalPool.length);
  return finalPool[index];
}

/**
 * Builds one full round: a role for every player (with the exact requested
 * spy count) and a single shared location. Regular players all resolve to
 * the same `location`; spies never see it (see `getRevealForPlayer`).
 */
export function createRound({ players, spies, builtIn = [], custom = [], excludeIds = [], rng = Math.random }) {
  const roles = assignRoles({ players, spies, rng });
  const location = pickLocation({ builtIn, custom, excludeIds, rng });
  return { roles, location };
}

/**
 * What a specific player should see when they reveal their card. Spies get
 * `{ isSpy: true, locationName: null }` — the location name is never
 * computed for them. Regular players get the round's shared location,
 * resolved in the requested language.
 */
export function getRevealForPlayer({ round, playerIndex, lang }) {
  const role = round.roles[playerIndex];
  if (role === "spy") {
    return { isSpy: true, locationName: null };
  }
  return { isSpy: false, locationName: getLocationName(round.location, lang) };
}

/**
 * Round-over resolution helpers. Both are pure comparisons against the
 * round's already-decided roles/location — they never generate secrets,
 * they only check a guess against what was already dealt.
 */

/** True if the accused player was actually one of the round's spies. */
export function didCatchSpy({ round, playerIndex }) {
  return round.roles[playerIndex] === "spy";
}

/** True if `locationId` matches the location the spy(s) actually had to blend into. */
export function isCorrectLocationGuess({ round, locationId }) {
  return Boolean(round.location) && round.location.id === locationId;
}
