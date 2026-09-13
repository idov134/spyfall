import { BUILT_IN_LOCATIONS } from "../data/locations";
import {
  MIN_PLAYERS,
  MIN_SPIES,
  assignRoles,
  createRound,
  getRevealForPlayer,
  pickLocation,
  shuffle,
  validateSettings,
} from "./gameLogic";

/** Deterministic RNG: cycles through a fixed sequence of [0, 1) values. */
function sequenceRng(values) {
  let i = 0;
  return () => {
    const value = values[i % values.length];
    i += 1;
    return value;
  };
}

describe("shuffle", () => {
  it("does not mutate the input array", () => {
    const input = [1, 2, 3, 4];
    shuffle(input, sequenceRng([0, 0, 0, 0]));
    expect(input).toEqual([1, 2, 3, 4]);
  });

  it("is deterministic for a given rng (classic Fisher-Yates trace)", () => {
    // rng always returns 0 -> j is always 0 -> each step swaps the current
    // last unplaced element into position 0. Traced by hand:
    // [1,2,3,4,5] -> [5,2,3,4,1] -> [4,2,3,5,1] -> [3,2,4,5,1] -> [2,3,4,5,1]
    const result = shuffle([1, 2, 3, 4, 5], sequenceRng([0]));
    expect(result).toEqual([2, 3, 4, 5, 1]);
  });

  it("keeps the same multiset of elements", () => {
    const input = ["a", "b", "c", "d", "e"];
    const result = shuffle(input, Math.random);
    expect(result.slice().sort()).toEqual(input.slice().sort());
  });
});

describe("validateSettings", () => {
  it("is valid for a normal configuration", () => {
    expect(validateSettings({ players: 8, spies: 2 })).toEqual({ valid: true, errors: [] });
  });

  it("rejects fewer than the minimum players", () => {
    const { valid, errors } = validateSettings({ players: MIN_PLAYERS - 1, spies: 1 });
    expect(valid).toBe(false);
    expect(errors.some((e) => e.key === "You need at least {{min}} players")).toBe(true);
  });

  it("rejects fewer than the minimum spies", () => {
    const { valid, errors } = validateSettings({ players: 6, spies: MIN_SPIES - 1 });
    expect(valid).toBe(false);
    expect(errors.some((e) => e.key === "You need at least {{min}} spy")).toBe(true);
  });

  it("rejects spies count equal to or greater than players", () => {
    expect(validateSettings({ players: 5, spies: 5 }).valid).toBe(false);
    expect(validateSettings({ players: 5, spies: 6 }).valid).toBe(false);
  });
});

describe("assignRoles", () => {
  it.each([
    [3, 1],
    [6, 2],
    [8, 3],
    [16, 15],
  ])("assigns exactly %i players / %i spies correctly", (players, spies) => {
    const roles = assignRoles({ players, spies, rng: Math.random });
    expect(roles).toHaveLength(players);
    expect(roles.filter((role) => role === "spy")).toHaveLength(spies);
    expect(roles.filter((role) => role === "player")).toHaveLength(players - spies);
  });

  it("throws for invalid settings instead of silently misbehaving", () => {
    expect(() => assignRoles({ players: 2, spies: 1 })).toThrow();
    expect(() => assignRoles({ players: 5, spies: 5 })).toThrow();
  });

  it("does not depend on UI ordering: a real shuffle can redistribute roles", () => {
    // rng always 0 -> Fisher-Yates always swaps with index 0 -> full reverse.
    // rng always ~1 -> j === i every step -> no swaps -> identity order.
    // For an asymmetric players/spies split these are guaranteed to differ,
    // proving role order isn't tied to the original index-based layout.
    const reversed = assignRoles({ players: 10, spies: 3, rng: () => 0 });
    const identity = assignRoles({ players: 10, spies: 3, rng: () => 0.9999999 });
    expect(reversed).not.toEqual(identity);
  });
});

describe("pickLocation", () => {
  const pool = [{ id: "a" }, { id: "b" }, { id: "c" }];

  it("picks a location deterministically based on rng", () => {
    expect(pickLocation({ builtIn: pool, rng: sequenceRng([0]) })).toEqual({ id: "a" });
    expect(pickLocation({ builtIn: pool, rng: sequenceRng([0.999]) })).toEqual({ id: "c" });
  });

  it("avoids excluded ids when possible", () => {
    for (let i = 0; i < 20; i += 1) {
      const result = pickLocation({ builtIn: pool, excludeIds: ["a", "b"], rng: () => i / 20 });
      expect(result.id).toBe("c");
    }
  });

  it("falls back to the full pool if every location is excluded", () => {
    const result = pickLocation({ builtIn: pool, excludeIds: ["a", "b", "c"], rng: () => 0 });
    expect(pool.map((p) => p.id)).toContain(result.id);
  });

  it("includes custom locations in the pool", () => {
    const custom = [{ id: "custom-1" }];
    const result = pickLocation({ builtIn: pool, custom, rng: sequenceRng([0.99]) });
    expect(result.id).toBe("custom-1");
  });

  it("returns null when the pool is empty", () => {
    expect(pickLocation({ builtIn: [], custom: [] })).toBeNull();
  });
});

describe("createRound + getRevealForPlayer", () => {
  it("gives every non-spy player exactly the same location", () => {
    const round = createRound({ players: 6, spies: 2, builtIn: BUILT_IN_LOCATIONS, rng: sequenceRng([0.42, 0.1, 0.7, 0.3, 0.55]) });

    const locationsSeenByRegularPlayers = round.roles
      .map((role, index) => getRevealForPlayer({ round, playerIndex: index, lang: "en" }))
      .filter((reveal) => !reveal.isSpy)
      .map((reveal) => reveal.locationName);

    expect(new Set(locationsSeenByRegularPlayers).size).toBe(1);
    expect(locationsSeenByRegularPlayers.length).toBe(round.roles.filter((r) => r === "player").length);
  });

  it("never exposes the location to a spy", () => {
    const round = createRound({ players: 8, spies: 3, builtIn: BUILT_IN_LOCATIONS, rng: sequenceRng([0.11, 0.87, 0.33]) });

    round.roles.forEach((role, index) => {
      if (role === "spy") {
        const reveal = getRevealForPlayer({ round, playerIndex: index, lang: "en" });
        expect(reveal.isSpy).toBe(true);
        expect(reveal.locationName).toBeNull();
      }
    });
  });

  it("reshuffles roles and re-picks a location on a new round", () => {
    const roundOne = createRound({
      players: 6,
      spies: 2,
      builtIn: BUILT_IN_LOCATIONS,
      rng: sequenceRng([0.05, 0.9, 0.2, 0.7, 0.4, 0.15]),
    });
    const roundTwo = createRound({
      players: 6,
      spies: 2,
      builtIn: BUILT_IN_LOCATIONS,
      excludeIds: roundOne.location ? [roundOne.location.id] : [],
      rng: sequenceRng([0.9, 0.1, 0.6, 0.3, 0.8, 0.65]),
    });

    expect(roundTwo.roles).toHaveLength(6);
    expect(roundTwo.roles.filter((r) => r === "spy")).toHaveLength(2);
    if (roundOne.location && roundTwo.location) {
      expect(roundTwo.location.id).not.toBe(roundOne.location.id);
    }
  });

  it("resolves the shown location in the requested language", () => {
    const round = createRound({ players: 4, spies: 1, builtIn: BUILT_IN_LOCATIONS, rng: sequenceRng([0.2]) });
    const regularIndex = round.roles.findIndex((role) => role === "player");

    const en = getRevealForPlayer({ round, playerIndex: regularIndex, lang: "en" });
    const he = getRevealForPlayer({ round, playerIndex: regularIndex, lang: "he" });

    expect(en.locationName).toBe(round.location.names.en);
    expect(he.locationName).toBe(round.location.names.he);
  });
});
