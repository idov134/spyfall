import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { BUILT_IN_LOCATIONS, getLocationName, toLocationObject } from "../data/locations";
import { normalizeLocationName } from "../game/gameLogic";

/**
 * Shared search/filter logic for any screen that browses the merged
 * built-in + custom location catalog: the read-only locations reference
 * modal, and the spy's "guess the location" screen at the end of a round.
 * Never reveals which location is actually in play — it only lists what
 * could be.
 */
export function useLocationSearch(customLocations = []) {
  const { i18n } = useTranslation();
  const [search, setSearch] = useState("");

  const allLocations = useMemo(() => {
    const merged = [...BUILT_IN_LOCATIONS, ...customLocations.map(toLocationObject)];
    return merged
      .map((location) => ({ id: location.id, name: getLocationName(location, i18n.language) }))
      .sort((a, b) => a.name.localeCompare(b.name, i18n.language));
  }, [customLocations, i18n.language]);

  const filteredLocations = useMemo(() => {
    const normalizedSearch = normalizeLocationName(search);
    if (!normalizedSearch) return allLocations;
    return allLocations.filter((location) =>
      normalizeLocationName(location.name).includes(normalizedSearch)
    );
  }, [allLocations, search]);

  return { search, setSearch, filteredLocations };
}
