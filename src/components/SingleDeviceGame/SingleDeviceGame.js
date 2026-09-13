import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import "./SingleDeviceGame.css";

import OptionCard from "../OptionsCard/OptionsCard";
import SettingsIcon from "@mui/icons-material/Settings";
import RolePopUp from "../RolePopUp/RolePopUp";

import getPlace from "../../services/GeminiService";
import { getRandomDefaultPlace } from "../../data/places";

import isEmptyArray from "../../utils";

function createPlayerCards(playerCount) {
  return Array.from({ length: playerCount }, () => ({
    role: "Player",
    opened: false,
  }));
}

function assignSpies(playerCount, spyCount) {
  const optionsCopy = createPlayerCards(playerCount);
  let remainingSpies = Math.min(spyCount, playerCount);

  while (remainingSpies > 0) {
    const randomIndex = Math.floor(Math.random() * playerCount);
    if (optionsCopy[randomIndex].role !== "Spy") {
      optionsCopy[randomIndex] = { role: "Spy", opened: false };
      remainingSpies--;
    }
  }

  return optionsCopy;
}

function SingleDeviceGame({ openSettings }) {
  const players = useSelector((state) => state.settings.players);
  const spies = useSelector((state) => state.settings.spies);
  const addedPlaces = useSelector((state) => state.settings.addedPlaces);

  const { t, i18n } = useTranslation();

  const [options, setOptions] = useState(() => createPlayerCards(players));
  const [gameCount, setGameCount] = useState(0);
  const [openedRole, setOpenedRole] = useState("");
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [place, setPlace] = useState("");

  useEffect(() => {
    setPlace(t("Loading..."));
    setOptions(assignSpies(players, spies));

    if (!isEmptyArray(addedPlaces)) {
      const randomIndex = Math.floor(Math.random() * addedPlaces.length);
      setPlace(addedPlaces[randomIndex]);
      return;
    }

    let cancelled = false;
    getPlace(i18n.language).then((res) => {
      if (!cancelled) {
        setPlace(res || getRandomDefaultPlace(i18n.language));
      }
    });

    return () => {
      cancelled = true;
    };
    // Re-deal only when a new round starts (or on first mount).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameCount]);

  const openCard = (index) => {
    if (options[index - 1].opened) return;
    const optionsCopy = options.map((option, optionIndex) =>
      optionIndex === index - 1 ? { ...option, opened: true } : option
    );
    setOptions(optionsCopy);
    setOpenedRole(optionsCopy[index - 1].role);
    setIsPopUpOpen(true);
  };

  const handleClose = () => {
    setIsPopUpOpen(false);
  };

  return (
    <>
      {isPopUpOpen && (
        <RolePopUp value={openedRole} handleClose={handleClose} place={place} />
      )}
      <div className="single-device-game page-container">
        <div className="title with-setting-icon">
          <div className="title-txt">{t("Would you find the Spy?")}</div>
          <div className="setting-icon">
            <SettingsIcon onClick={() => openSettings()} />
          </div>
        </div>

        <div className="options-grid">
          {options.map((option, index) => (
            <OptionCard
              key={index}
              index={index + 1}
              opened={option.opened}
              openCard={openCard}
            />
          ))}
        </div>

        <div
          className="start-game-btn"
          onClick={() => {
            setIsPopUpOpen(false);
            setOptions(createPlayerCards(players));
            setGameCount((prev) => prev + 1);
          }}
        >
          {t("Start New Game")}
        </div>
      </div>
    </>
  );
}

export default SingleDeviceGame;
