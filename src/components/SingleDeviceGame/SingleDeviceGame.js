import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import "./SingleDeviceGame.css";

import SettingsIcon from "@mui/icons-material/Settings";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Modal from "@mui/material/Modal";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";

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
 * One tile per player. During the "viewing" phase, a card that has already
 * been viewed is disabled and grayed out so it can't be tapped again — a
 * player only ever gets one uninterrupted look before it locks. During
 * "discussion", every card stays tappable so players can privately check
 * their role again (the actual reveal happens in `RevealModal`, which
 * requires a deliberate hold, never a plain tap).
 */
function PlayerCardGrid({ playerCount, viewed, phase, onSelect }) {
  const { t } = useTranslation();

  return (
    <Grid container spacing={1.5} justifyContent="center" className="player-card-grid">
      {Array.from({ length: playerCount }, (_, index) => {
        const playerNumber = index + 1;
        const hasViewed = viewed[index];
        const isLocked = phase === "viewing" && hasViewed;

        return (
          <Grid item xs={4} sm={3} key={playerNumber}>
            <Card
              className={`player-card${hasViewed ? " player-card--viewed" : ""}`}
              elevation={hasViewed ? 1 : 4}
            >
              <CardActionArea
                className="player-card-action"
                disabled={isLocked}
                onClick={() => onSelect(index)}
                aria-label={
                  hasViewed
                    ? t("Player {{number}} - card viewed", { number: playerNumber })
                    : t("Player {{number}} - tap to view card", { number: playerNumber })
                }
              >
                <CardContent className="player-card-content">
                  {hasViewed ? (
                    <CheckCircleIcon className="player-card-icon" />
                  ) : (
                    <PersonIcon className="player-card-icon" />
                  )}
                  <div className="player-card-label">
                    {t("Player {{number}}", { number: playerNumber })}
                  </div>
                  {phase === "viewing" && hasViewed && (
                    <div className="player-card-status">{t("Viewed")}</div>
                  )}
                  {phase === "discussion" && (
                    <div className="player-card-status">{t("Tap to remind yourself")}</div>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}

/**
 * The private reveal surface for a single player.
 *
 * - `mode="instant"` (first viewing pass): the secret is shown as soon as
 *   the modal opens — this mirrors the old explicit "Reveal card" tap, just
 *   one step earlier. Closing it is a one-way action that marks the card
 *   Viewed.
 * - `mode="hold"` (discussion re-check): the secret is hidden by default.
 *   It is shown ONLY while the player is actively pressing the "Hold to
 *   reveal" control (mouse/touch/keyboard) and disappears the instant they
 *   release it — so a glance from someone else at the table can't catch a
 *   role left on-screen.
 */
function RevealModal({ open, mode, playerNumber, isSpy, locationName, isHolding, onHoldStart, onHoldEnd, onClose }) {
  const { t } = useTranslation();
  const showSecret = mode === "instant" || isHolding;

  const stopHolding = (event) => {
    event.preventDefault();
    onHoldEnd();
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="reveal-modal-title">
      <div className="reveal-modal">
        <h2 id="reveal-modal-title" className="reveal-modal-title">
          {playerNumber != null ? t("Player {{number}}", { number: playerNumber }) : ""}
        </h2>

        <div className="reveal-modal-secret" role="status">
          {showSecret ? (
            <h1 className="reveal-modal-secret-text">
              {isSpy ? t("You are the Spy.") : locationName}
            </h1>
          ) : (
            <p className="reveal-modal-hint">{t("Press and hold to reveal")}</p>
          )}
        </div>

        {mode === "instant" ? (
          <button type="button" className="hide-btn" onClick={onClose}>
            {t("Got it, hide card")}
          </button>
        ) : (
          <div className="reveal-modal-actions">
            <button
              type="button"
              className={`hold-reveal-btn${isHolding ? " is-holding" : ""}`}
              onMouseDown={onHoldStart}
              onMouseUp={stopHolding}
              onMouseLeave={stopHolding}
              onTouchStart={(event) => {
                event.preventDefault();
                onHoldStart();
              }}
              onTouchEnd={stopHolding}
              onTouchCancel={stopHolding}
              onKeyDown={(event) => {
                if (event.key === " " || event.key === "Enter") {
                  event.preventDefault();
                  onHoldStart();
                }
              }}
              onKeyUp={(event) => {
                if (event.key === " " || event.key === "Enter") {
                  event.preventDefault();
                  onHoldEnd();
                }
              }}
            >
              {t("Hold to reveal")}
            </button>
            <button type="button" className="hide-btn" onClick={onClose}>
              {t("Close")}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

/** Neutral banner shown once every player has viewed their card. */
function DiscussionBanner() {
  const { t } = useTranslation();
  return (
    <div className="discussion-banner">
      <h2>{t("Everyone has viewed their card")}</h2>
      <p>{t("Start discussion")}</p>
      <p className="discussion-hint">{t("Tap your card and hold to check your role again.")}</p>
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
  const [viewed, setViewed] = useState(() => Array(players).fill(false));
  const [phase, setPhase] = useState("viewing"); // "viewing" | "discussion"
  const [activePlayerIndex, setActivePlayerIndex] = useState(null);
  const [isHolding, setIsHolding] = useState(false);

  const allViewed = viewed.length > 0 && viewed.every(Boolean);

  // Once the last card is closed, move everyone to discussion automatically
  // rather than requiring an extra button — nobody's card stays exposed in
  // the meantime because closing a card is what marks it Viewed.
  useEffect(() => {
    if (phase === "viewing" && allViewed) {
      setPhase("discussion");
    }
  }, [phase, allViewed]);

  const startNewRound = () => {
    const nextRound = buildRound(players, spies, customLocations, recentLocationIds);
    setRound(nextRound);
    setRecentLocationIds((previous) =>
      nextRound.location
        ? [nextRound.location.id, ...previous].slice(0, MAX_RECENT_LOCATIONS)
        : previous
    );
    setViewed(Array(players).fill(false));
    setPhase("viewing");
    setActivePlayerIndex(null);
    setIsHolding(false);
  };

  const handleSelectPlayer = (index) => {
    if (phase === "viewing" && viewed[index]) return; // locked, cannot re-open
    setActivePlayerIndex(index);
    setIsHolding(false);
  };

  const handleCloseModal = () => {
    if (phase === "viewing" && activePlayerIndex !== null) {
      setViewed((previous) => {
        const next = [...previous];
        next[activePlayerIndex] = true;
        return next;
      });
    }
    setActivePlayerIndex(null);
    setIsHolding(false);
  };

  const activeReveal =
    activePlayerIndex !== null
      ? getRevealForPlayer({ round, playerIndex: activePlayerIndex, lang: i18n.language })
      : null;

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

      {phase === "viewing" ? (
        <p className="phase-instruction">
          {t("Pass the device around: tap your card to view your role.")}
        </p>
      ) : (
        <DiscussionBanner />
      )}

      <PlayerCardGrid
        playerCount={players}
        viewed={viewed}
        phase={phase}
        onSelect={handleSelectPlayer}
      />

      <RevealModal
        open={activePlayerIndex !== null}
        mode={phase === "viewing" ? "instant" : "hold"}
        playerNumber={activePlayerIndex !== null ? activePlayerIndex + 1 : null}
        isSpy={activeReveal?.isSpy}
        locationName={activeReveal?.locationName}
        isHolding={isHolding}
        onHoldStart={() => setIsHolding(true)}
        onHoldEnd={() => setIsHolding(false)}
        onClose={handleCloseModal}
      />

      <button type="button" className="start-game-btn" onClick={startNewRound}>
        {t("New round")}
      </button>
    </div>
  );
}

export default SingleDeviceGame;
