import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import InputPopUp from "../InputPopUp/InputPopUp";
import AddPlaces from "../AddPlaces/AddPlaces";

import "./SingleDeviceSettings.css";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import PeopleIcon from "@mui/icons-material/People";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import TimerIcon from "@mui/icons-material/Timer";

import {
  addCustomLocation,
  decPlayers,
  decSpies,
  decTimerMinutes,
  incPlayers,
  incSpies,
  incTimerMinutes,
  removeCustomLocation,
} from "../../store/reducers/settingsReducer";
import {
  MAX_DISCUSSION_MINUTES,
  MAX_PLAYERS,
  MIN_DISCUSSION_MINUTES,
  MIN_PLAYERS,
  MIN_SPIES,
  normalizeLocationName,
  validateSettings,
} from "../../game/gameLogic";
import { BUILT_IN_LOCATIONS, getLocationName } from "../../data/locations";

function SingleDeviceSettings({ startGame }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const players = useSelector((state) => state.settings.players);
  const spies = useSelector((state) => state.settings.spies);
  const timerMinutes = useSelector((state) => state.settings.timerMinutes);
  const customLocations = useSelector((state) => state.settings.customLocations);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [addError, setAddError] = useState("");

  const builtInNames = useMemo(
    () =>
      new Set(
        BUILT_IN_LOCATIONS.map((location) =>
          normalizeLocationName(getLocationName(location, i18n.language))
        )
      ),
    [i18n.language]
  );

  const { valid: settingsAreValid, errors: settingsErrors } = validateSettings({
    players,
    spies,
  });

  const openAddPlace = () => {
    setAddError("");
    setIsPopUpOpen(true);
  };

  const handleClose = () => {
    setIsPopUpOpen(false);
    setAddError("");
  };

  const handleSubmit = (rawName) => {
    const trimmed = String(rawName || "").trim();

    if (trimmed.length < 2 || trimmed.length > 30) {
      setAddError(t("Location name must be between 2 and 30 characters"));
      return;
    }

    const normalized = normalizeLocationName(trimmed);
    const isDuplicate =
      builtInNames.has(normalized) ||
      customLocations.some((location) => normalizeLocationName(location.name) === normalized);

    if (isDuplicate) {
      setAddError(t("This location already exists"));
      return;
    }

    dispatch(addCustomLocation(trimmed));
    setIsPopUpOpen(false);
    setAddError("");
  };

  const handleRemoveLocation = (id) => {
    dispatch(removeCustomLocation(id));
  };

  return (
    <>
      {isPopUpOpen && (
        <InputPopUp
          handleClose={handleClose}
          handleSubmit={handleSubmit}
          label={t("Add Places")}
          error={addError}
        />
      )}
      <div className="settings-container page-container">
        <div className="title">{t("Game Settings")}</div>

        <div className="setting">
          <span className="setting-label" id="players-label">
            <PeopleIcon />
            {t("Total players")}:
          </span>
          <div className="setting-area" role="group" aria-labelledby="players-label">
            <button
              type="button"
              className="change-btn dec"
              aria-label={t("Decrease players")}
              disabled={players <= MIN_PLAYERS || players - 1 <= spies}
              onClick={() => dispatch(decPlayers())}
            >
              <RemoveIcon fontSize="small" />
            </button>
            <span aria-live="polite">{players}</span>
            <button
              type="button"
              className="change-btn inc"
              aria-label={t("Increase players")}
              disabled={players >= MAX_PLAYERS}
              onClick={() => dispatch(incPlayers())}
            >
              <AddIcon fontSize="small" />
            </button>
          </div>
        </div>

        <div className="setting">
          <span className="setting-label" id="spies-label">
            <DirectionsRunIcon />
            {t("Total spies")}:
          </span>
          <div className="setting-area" role="group" aria-labelledby="spies-label">
            <button
              type="button"
              className="change-btn dec"
              aria-label={t("Decrease spies")}
              disabled={spies <= MIN_SPIES}
              onClick={() => dispatch(decSpies())}
            >
              <RemoveIcon fontSize="small" />
            </button>
            <span aria-live="polite">{spies}</span>
            <button
              type="button"
              className="change-btn inc"
              aria-label={t("Increase spies")}
              disabled={spies + 1 >= players}
              onClick={() => dispatch(incSpies())}
            >
              <AddIcon fontSize="small" />
            </button>
          </div>
        </div>

        <div className="setting">
          <span className="setting-label" id="timer-label">
            <TimerIcon />
            {t("Discussion timer")}:
          </span>
          <div className="setting-area setting-area-wide" role="group" aria-labelledby="timer-label">
            <button
              type="button"
              className="change-btn dec"
              aria-label={t("Decrease timer")}
              disabled={timerMinutes <= MIN_DISCUSSION_MINUTES}
              onClick={() => dispatch(decTimerMinutes())}
            >
              <RemoveIcon fontSize="small" />
            </button>
            <span aria-live="polite">{t("{{minutes}} min", { minutes: timerMinutes })}</span>
            <button
              type="button"
              className="change-btn inc"
              aria-label={t("Increase timer")}
              disabled={timerMinutes >= MAX_DISCUSSION_MINUTES}
              onClick={() => dispatch(incTimerMinutes())}
            >
              <AddIcon fontSize="small" />
            </button>
          </div>
        </div>

        <AddPlaces
          openAddPlace={openAddPlace}
          customLocations={customLocations}
          handleRemove={handleRemoveLocation}
        />

        {!settingsAreValid && (
          <div className="settings-error" role="alert">
            {settingsErrors.map((error) => t(error.key, error.params)).join(" ")}
          </div>
        )}

        <button
          type="button"
          className="start-game-btn"
          onClick={startGame}
          disabled={!settingsAreValid}
        >
          {t("Start Game")}
        </button>
      </div>
    </>
  );
}

export default SingleDeviceSettings;
