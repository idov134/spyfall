import "../../i18n";
import { configureStore } from "@reduxjs/toolkit";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";

import settingsReducer from "../../store/reducers/settingsReducer";
import { DEFAULT_DISCUSSION_MINUTES } from "../../game/gameLogic";
import SingleDeviceGame from "./SingleDeviceGame";

function renderGame({
  players = 3,
  spies = 1,
  customLocations = [],
  timerMinutes = DEFAULT_DISCUSSION_MINUTES,
} = {}) {
  const store = configureStore({
    reducer: { settings: settingsReducer },
    preloadedState: { settings: { players, spies, customLocations, timerMinutes } },
  });
  render(
    <Provider store={store}>
      <SingleDeviceGame openSettings={() => {}} />
    </Provider>
  );
  return store;
}

function viewCard(playerNumber) {
  fireEvent.click(
    screen.getByRole("button", { name: new RegExp(`Player ${playerNumber} - tap to view card`, "i") })
  );
  // "instant" mode reveals as soon as the modal opens.
  fireEvent.click(screen.getByRole("button", { name: /Got it, hide card/i }));
}

describe("SingleDeviceGame - private card grid flow", () => {
  it("starts with a grid of concealed cards and no secrets visible", () => {
    renderGame({ players: 3, spies: 1 });

    expect(
      screen.getByText(/Pass the device around: tap your card to view your role\./i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Player 1 - tap to view card/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Player 2 - tap to view card/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Player 3 - tap to view card/i })).toBeInTheDocument();
    expect(screen.queryByText(/You are the Spy\./i)).not.toBeInTheDocument();
  });

  it("reveals a player's role instantly on tap, then locks the card once closed", () => {
    renderGame({ players: 3, spies: 1 });

    fireEvent.click(screen.getByRole("button", { name: /Player 1 - tap to view card/i }));

    // Instant mode: the secret is already visible while the modal is open.
    expect(screen.getByRole("status")).toBeInTheDocument();
    const hasSpyText = screen.queryByText(/You are the Spy\./i) !== null;
    expect(hasSpyText || screen.getByRole("status").textContent.length > 0).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: /Got it, hide card/i }));

    // Secret is gone from the screen, and the card is now locked/viewed.
    expect(screen.queryByText(/You are the Spy\./i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Player 1 - card viewed/i })).toBeDisabled();
  });

  it("never lets a viewed card be tapped again during the viewing phase", () => {
    renderGame({ players: 3, spies: 1 });

    viewCard(1);

    expect(screen.queryByRole("button", { name: /Player 1 - tap to view card/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Player 1 - card viewed/i })).toBeDisabled();
  });

  it("shows a neutral discussion screen only after every player has viewed their card, leaking nothing", () => {
    renderGame({ players: 3, spies: 1 });

    viewCard(1);
    viewCard(2);
    expect(screen.queryByText(/Everyone has viewed their card/i)).not.toBeInTheDocument();
    viewCard(3);

    expect(screen.getByText(/Everyone has viewed their card/i)).toBeInTheDocument();
    expect(screen.queryByText(/You are the Spy\./i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /tap to view card/i })).not.toBeInTheDocument();
  });

  it("in discussion phase, tapping a card does not reveal the secret without holding", () => {
    renderGame({ players: 3, spies: 1 });

    viewCard(1);
    viewCard(2);
    viewCard(3);

    fireEvent.click(screen.getByRole("button", { name: /Player 1 - card viewed/i }));

    expect(screen.getByText(/Press and hold to reveal/i)).toBeInTheDocument();
    expect(screen.queryByText(/You are the Spy\./i)).not.toBeInTheDocument();
  });

  it("in discussion phase, holding reveals the secret and releasing hides it again", () => {
    renderGame({ players: 3, spies: 1 });

    viewCard(1);
    viewCard(2);
    viewCard(3);

    fireEvent.click(screen.getByRole("button", { name: /Player 1 - card viewed/i }));

    const holdButton = screen.getByRole("button", { name: /Hold to reveal/i });
    fireEvent.mouseDown(holdButton);

    const revealedText = screen.getByRole("status").textContent;
    expect(revealedText.length).toBeGreaterThan(0);
    expect(screen.queryByText(/Press and hold to reveal/i)).not.toBeInTheDocument();

    fireEvent.mouseUp(holdButton);

    expect(screen.getByText(/Press and hold to reveal/i)).toBeInTheDocument();
  });

  it("closing the discussion re-check modal keeps the card unlocked for future checks", () => {
    renderGame({ players: 3, spies: 1 });

    viewCard(1);
    viewCard(2);
    viewCard(3);

    fireEvent.click(screen.getByRole("button", { name: /Player 1 - card viewed/i }));
    fireEvent.click(screen.getByRole("button", { name: /Close/i }));

    expect(screen.getByRole("button", { name: /Player 1 - card viewed/i })).not.toBeDisabled();
  });

  it("New round resets every card to concealed and returns to the viewing phase", () => {
    renderGame({ players: 3, spies: 1 });

    viewCard(1);
    viewCard(2);
    viewCard(3);
    expect(screen.getByText(/Everyone has viewed their card/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /New round/i }));

    expect(
      screen.getByText(/Pass the device around: tap your card to view your role\./i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Player 1 - tap to view card/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Player 2 - tap to view card/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Player 3 - tap to view card/i })).toBeInTheDocument();
    expect(screen.queryByText(/You are the Spy\./i)).not.toBeInTheDocument();
  });
});

describe("SingleDeviceGame - game timer", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("is visible immediately at the player-configured duration, before anyone has viewed a card", () => {
    renderGame({ players: 3, spies: 1, timerMinutes: 5 });

    expect(screen.getByRole("timer")).toHaveTextContent("05:00");
  });

  it("keeps counting down while cards are being viewed, and continues uninterrupted into discussion", () => {
    renderGame({ players: 3, spies: 1, timerMinutes: 8 });

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(screen.getByRole("timer")).toHaveTextContent("07:55");

    viewCard(1);
    viewCard(2);
    viewCard(3);

    // Discussion has now started, but the clock did not reset.
    expect(screen.getByText(/Everyone has viewed their card/i)).toBeInTheDocument();
    expect(screen.getByRole("timer")).toHaveTextContent("07:55");

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByRole("timer")).toHaveTextContent("07:52");
  });

  it("pausing stops the countdown, and resuming continues it", () => {
    renderGame({ players: 3, spies: 1, timerMinutes: 8 });

    fireEvent.click(screen.getByRole("button", { name: /Pause/i }));
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(screen.getByRole("timer")).toHaveTextContent("08:00");

    fireEvent.click(screen.getByRole("button", { name: /Resume/i }));
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByRole("timer")).toHaveTextContent("07:57");
  });

  it("reaching 00:00 stops the countdown and shows Time's up!, without disrupting the game", () => {
    renderGame({ players: 3, spies: 1, timerMinutes: 1 });
    viewCard(1);
    viewCard(2);
    viewCard(3);

    act(() => {
      jest.advanceTimersByTime(60 * 1000);
    });

    expect(screen.getByRole("timer")).toHaveTextContent("00:00");
    expect(screen.getByText(/Time's up!/i)).toBeInTheDocument();
    // The game itself keeps going — cards are still there, no round-over screen.
    expect(screen.getByText(/Everyone has viewed their card/i)).toBeInTheDocument();
  });

  it("reaching 00:00 during the viewing phase (before discussion starts) behaves the same way", () => {
    renderGame({ players: 3, spies: 1, timerMinutes: 1 });

    act(() => {
      jest.advanceTimersByTime(60 * 1000);
    });

    expect(screen.getByRole("timer")).toHaveTextContent("00:00");
    expect(screen.getByText(/Time's up!/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Pass the device around: tap your card to view your role\./i)
    ).toBeInTheDocument();
  });

  it("'End round now' immediately jumps the clock to 00:00 and shows Time's up!", () => {
    renderGame({ players: 3, spies: 1 });
    viewCard(1);
    viewCard(2);
    viewCard(3);

    fireEvent.click(screen.getByRole("button", { name: /End round now/i }));

    expect(screen.getByRole("timer")).toHaveTextContent("00:00");
    expect(screen.getByText(/Time's up!/i)).toBeInTheDocument();
  });

  it("New round resets the clock back to the configured duration", () => {
    renderGame({ players: 3, spies: 1, timerMinutes: 8 });
    viewCard(1);
    viewCard(2);
    viewCard(3);
    fireEvent.click(screen.getByRole("button", { name: /End round now/i }));
    expect(screen.getByText(/Time's up!/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /New round/i }));

    expect(screen.getByRole("timer")).toHaveTextContent("08:00");
    expect(
      screen.getByText(/Pass the device around: tap your card to view your role\./i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Player 1 - tap to view card/i })).toBeInTheDocument();
    expect(screen.queryByText(/You are the Spy\./i)).not.toBeInTheDocument();
  });
});
