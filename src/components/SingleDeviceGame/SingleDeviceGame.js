import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import "./SingleDeviceGame.css";

import SettingsIcon from "@mui/icons-material/Settings";

import { createRound, getRevealForPlayer } from "../../game/gameLogic";
import { BUILT_IN_LOCATIONS, toLocationObject } from "../../data/locations";

const MAX_RECENT_LOCATIONS = 3;

function buildRound(players, spies, customLocations, excludeIds) {
  return createRound({
    players,
    spies,
    builtIn: BUILT_IN_LOCATIONS,
    custom: customLocations.map(toLocationObject),
    excludeIds,
  });
}

/**
 * One player's private turn: a concealed instruction to pass the device,
 * a deliberate "Reveal card" tap, then "Hide card" before handing the
 * device to the next player. The role never appears without that tap, and
 * hiding it is required before moving on.
 */
function PlayerTurnCard({ playerNumber, totalPlayers, isRevealed, isSpy, locationName, onReveal, onHide }) {
  const { t } = useTranslation();

  return (
    <div className="player-turn-card">
      {!isRevealed && (
        <>
          <p className="pass-instruction">
            {t("Pass the device to Player {{number}}.", { number: playerNumber })}
          </p>
          <p className="player-progress">
            {t("Player {{current}} of {{total}}", { current: playerNumber, total: totalPlayers })}
          </p>
          <button type="button" className="reveal-btn" onClick={onReveal}>
            {t("Reveal card")}
          </button>
        </>
      )}

      {isRevealed && (
        <>
          <div className="role-reveal" role="status">
            <h1>{isSpy ? t("You are the Spy.") : locationName}</h1>
          </div>
          <button type="button" className="hide-btn" onClick={onHide}>
            {t("Hide card")}
          </button>
        </>
      )}
    </div>
  );
}

/** Neutral screen shown once every player has viewed and hidden their card. */
function DiscussionScreen() {
  const { t } = useTranslation();
  return (
    <div className="discussion-screen">
      <h2>{t("Everyone has viewed their card")}</h2>
      <p>{t("Start discussion")}</p>
    </div>
  );
}

function SingleDeviceGame({ openSettings }) {
  const players = useSelector((state) => state.settings.players);
  const spies = useSelector((state) => state.settings.spies);
  const customLocations = useSelector((state) => state.settings.customLocations);

  const { t, i18n } = useTranslation();

  const [round, setRound] = useState(() => buildRound(players, spies, customLocations, []));
  const [recentLocationIds, setRecentLocationIds] = useState(() =>
    round.location ? [round.location.id] : []
  );
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [phase, setPhase] = useState("passing"); // "passing" | "discussion"

  const isLastPlayer = currentPlayerIndex >= players - 1;

  const startNewRound = () => {
    const nextRound = buildRound(players, spies, customLocations, recentLocationIds);
    setRound(nextRound);
    setRecentLocationIds((previous) =>
      nextRound.location
        ? [nextRound.location.id, ...previous].slice(0, MAX_RECENT_LOCATIONS)
        : previous
    );
    setCurrentPlayerIndex(0);
    setIsRevealed(false);
    setPhase("passing");
  };

  const handleReveal = () => setIsRevealed(true);

  const handleHide = () => {
    setIsRevealed(false);
    if (isLastPlayer) {
      setPhase("discussion");
    } else {
      setCurrentPlayerIndex((index) => index + 1);
    }
  };

  const reveal = getRevealForPlayer({ round, playerIndex: currentPlayerIndex, lang: i18n.language });

  return (
    <div className="single-device-game page-container">
      <div className="title with-setting-icon">
        <div className="title-txt">{t("Spyfall")}</div>
        <button
          type="button"
          className="setting-icon"
          aria-label={t("Settings")}
          onClick={openSettings}
        >
          <SettingsIcon />
        </button>
      </div>

      {phase === "passing" ? (
        <PlayerTurnCard
          playerNumber={currentPlayerIndex + 1}
          totalPlayers={players}
          isRevealed={isRevealed}
          isSpy={reveal.isSpy}
          locationName={reveal.locationName}
          onReveal={handleReveal}
          onHide={handleHide}
        />
      ) : (
        <DiscussionScreen />
      )}

      <button type="button" className="start-game-btn" onClick={startNewRound}>
        {t("New round")}
      </button>
    </div>
  );
}

export default SingleDeviceGame;
