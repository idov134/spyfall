import "../../i18n";
import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";

import settingsReducer from "../../store/reducers/settingsReducer";
import SingleDeviceGame from "./SingleDeviceGame";

function renderGame({ players = 3, spies = 1, customLocations = [] } = {}) {
  const store = configureStore({
    reducer: { settings: settingsReducer },
    preloadedState: { settings: { players, spies, customLocations } },
  });
  render(
    <Provider store={store}>
      <SingleDeviceGame openSettings={() => {}} />
    </Provider>
  );
  return store;
}

describe("SingleDeviceGame - private reveal/hide flow", () => {
  it("starts concealed and only reveals after tapping Reveal card", () => {
    renderGame();

    expect(screen.getByText(/Pass the device to Player 1/i)).toBeInTheDocument();
    expect(screen.queryByText(/You are the Spy\./i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Reveal card/i }));

    // Once revealed, the pass instruction disappears and a Hide button appears.
    expect(screen.queryByText(/Pass the device to Player 1/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Hide card/i })).toBeInTheDocument();
  });

  it("never auto-reveals the next player after hiding", () => {
    renderGame();

    fireEvent.click(screen.getByRole("button", { name: /Reveal card/i }));
    fireEvent.click(screen.getByRole("button", { name: /Hide card/i }));

    expect(screen.getByText(/Pass the device to Player 2/i)).toBeInTheDocument();
    expect(screen.queryByText(/You are the Spy\./i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reveal card/i })).toBeInTheDocument();
  });

  it("shows a neutral discussion screen only after every player has viewed their card", () => {
    renderGame({ players: 3, spies: 1 });

    for (let player = 1; player <= 3; player += 1) {
      expect(screen.getByText(new RegExp(`Pass the device to Player ${player}`, "i"))).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /Reveal card/i }));
      fireEvent.click(screen.getByRole("button", { name: /Hide card/i }));
    }

    expect(screen.getByText(/Everyone has viewed their card/i)).toBeInTheDocument();
    expect(screen.queryByText(/Pass the device to Player/i)).not.toBeInTheDocument();
    // The neutral screen must never leak the location or who the spies were.
    expect(screen.queryByText(/You are the Spy\./i)).not.toBeInTheDocument();
  });

  it("New round resets to player 1, hides any previous reveal, and leaves passing phase", () => {
    renderGame({ players: 3, spies: 1 });

    fireEvent.click(screen.getByRole("button", { name: /Reveal card/i }));
    fireEvent.click(screen.getByRole("button", { name: /New round/i }));

    expect(screen.getByText(/Pass the device to Player 1/i)).toBeInTheDocument();
    expect(screen.queryByText(/You are the Spy\./i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reveal card/i })).toBeInTheDocument();
  });

  it("New round also resets an in-progress discussion phase back to player 1", () => {
    renderGame({ players: 3, spies: 1 });

    for (let player = 1; player <= 3; player += 1) {
      fireEvent.click(screen.getByRole("button", { name: /Reveal card/i }));
      fireEvent.click(screen.getByRole("button", { name: /Hide card/i }));
    }
    expect(screen.getByText(/Everyone has viewed their card/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /New round/i }));

    expect(screen.getByText(/Pass the device to Player 1/i)).toBeInTheDocument();
  });
});
