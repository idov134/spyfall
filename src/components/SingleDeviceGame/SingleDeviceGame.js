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
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";

import { createRound, getRevealForPlayer } from "../../game/gameLogic";
import { BUILT_IN_LOCATIONS, toLocationObject } from "../../data/locations";

const MAX_RECENT_LOCATIONS = 3;

function formatTime(totalSeconds) {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

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

/**
 * The countdown clock. It is rendered right under the title bar for the
 * entire active round — both while cards are being passed around and during
 * discussion — so players always have it in view, not just once discussion
 * officially starts.
 */
function GameTimer({ remainingSeconds, isRunning, onToggleRunning, onStop }) {
  const { t } = useTranslation();
  const timeIsUp = remainingSeconds === 0;

  return (
    <div className="game-timer">
      <div className="game-timer-value" role="timer">
        {formatTime(remainingSeconds)}
      </div>
      {timeIsUp ? (
        <div className="game-timer-up">{t("Time's up!")}</div>
      ) : (
        <div className="game-timer-controls">
          <button
            type="button"
            className="timer-btn"
            onClick={onToggleRunning}
            aria-label={isRunning ? t("Pause") : t("Resume")}
          >
            {isRunning ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
            {isRunning ? t("Pause") : t("Resume")}
          </button>
          <button type="button" className="timer-btn timer-btn-stop" onClick={onStop}>
            <StopIcon fontSize="small" />
            {t("End round now")}
          </button>
        </div>
      )}
    </div>
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
  const timerMinutes = useSelector((state) => state.settings.timerMinutes);
  const customLocations = useSelector((state) => state.settings.customLocations);

  const { t, i18n } = useTranslation();

  const discussionDurationSeconds = timerMinutes * 60;

  const [round, setRound] = useState(() => buildRound(players, spies, customLocations, []));
  const [recentLocationIds, setRecentLocationIds] = useState(() =>
    round.location ? [round.location.id] : []
  );
  const [viewed, setViewed] = useState(() => Array(players).fill(false));
  const [phase, setPhase] = useState("viewing"); // "viewing" | "discussion"
  const [activePlayerIndex, setActivePlayerIndex] = useState(null);
  const [isHolding, setIsHolding] = useState(false);
  // The countdown starts the moment the round begins — visible the whole
  // time cards are being passed around, not just once discussion starts —
  // so it's always in view while "the game is running".
  const [remainingSeconds, setRemainingSeconds] = useState(discussionDurationSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const allViewed = viewed.length > 0 && viewed.every(Boolean);

  // Once the last card is closed, move everyone to discussion. The
  // countdown keeps running uninterrupted — it never resets here.
  useEffect(() => {
    if (phase === "viewing" && allViewed) {
      setPhase("discussion");
    }
  }, [phase, allViewed]);

  // The countdown itself. Cleared on every re-run (pause/resume, unmount, or
  // reaching zero) so there is never more than one interval alive. Runs
  // during both "viewing" and "discussion" so the clock is always visible
  // and ticking while the round is active.
  useEffect(() => {
    if (!isTimerRunning) return undefined;
    const intervalId = setInterval(() => {
      setRemainingSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isTimerRunning]);

  // Hitting 00:00 just stops the clock and shows "Time's up!" — the game
  // itself keeps going so the table can keep discussing / voting out loud.
  useEffect(() => {
    if (remainingSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
  }, [remainingSeconds, isTimerRunning]);

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
    setRemainingSeconds(discussionDurationSeconds);
    setIsTimerRunning(true);
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

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    setRemainingSeconds(0);
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

      <GameTimer
        remainingSeconds={remainingSeconds}
        isRunning={isTimerRunning}
        onToggleRunning={() => setIsTimerRunning((previous) => !previous)}
        onStop={handleStopTimer}
      />

      {phase === "viewing" && (
        <p className="phase-instruction">
          {t("Pass the device around: tap your card to view your role.")}
        </p>
      )}

      {phase === "discussion" && <DiscussionBanner />}

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
