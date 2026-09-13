# Spyfall

A browser-based, pass-the-device version of the social deduction game
**Spyfall**, built for players sitting together in the same room.

## What the game is

Everyone shares one phone, tablet, or computer. At the start of a round:

1. The group sets the total number of players and the number of spies
   (spies must always be fewer than the total players).
2. The app randomly picks one secret location and randomly assigns the
   chosen number of spies among the players.
3. Every regular player is shown the same location. Every spy is shown
   only **"You are the Spy."** — spies never see the location.

There is no voice/text chat and no online multiplayer here: the players
talk face-to-face. Regular players try to spot the spy without giving the
location away; spies listen and try to guess the location before they're
caught.

## How an in-person round works (pass-the-device flow)

The device is passed from player to player, one at a time:

1. The screen shows a concealed instruction: **"Pass the device to Player
   N."** Nothing sensitive is visible yet.
2. That player taps **"Reveal card"** on purpose to see their role.
3. Regular players see the round's location; spies see **"You are the
   Spy."**
4. The player taps **"Hide card"** before handing the device to the next
   player. The next player's role is never shown automatically.
5. Once everyone has viewed and hidden their card, a neutral screen appears
   ("Everyone has viewed their card") — it never reveals the location or
   who the spies were. This is the cue to start talking.
6. Tapping **"New round"** reshuffles the spies and picks a new location
   (avoiding the last couple of locations when possible), and resets the
   reveal/hide state for every player.

## Locations

Built-in locations live in [`src/data/locations.js`](src/data/locations.js)
as a small, hand-written catalog of broad, familiar places (Airport,
Hospital, Pizza Place, Casino, Spaceship, ...) — no specific businesses or
addresses. Each entry looks like:

```js
{
  id: "pizza-place",
  category: "food",
  names: { en: "Pizza Place", he: "פיצרייה" },
}
```

To add a new built-in location, add another entry to that array with a
unique `id` and both an `en` and `he` name.

### Custom locations

Players can add their own locations from the settings screen ("Add
Places"). Custom locations:

- are validated (2–30 characters) and rejected if empty or an
  obvious duplicate of an existing built-in/custom location,
- are included in the random location pool for future rounds,
- can be removed again from the settings screen,
- persist across page refreshes via `localStorage` (see
  [`src/store/persistence.js`](src/store/persistence.js)) — they never
  modify `src/data/locations.js` itself.

Player count, spy count, and the chosen interface language are persisted
the same way, so refreshing the page keeps your setup.

## No AI dependency

This project has **no Gemini (or any other generative-AI) dependency**.
Locations come entirely from the local catalog above plus whatever custom
locations players add. There are no API keys, no `REACT_APP_GEMINI_*`
environment variables, and no network calls required to play.

## Languages

The app supports English and Hebrew via `i18next` / `react-i18next`
(see [`src/i18n.js`](src/i18n.js)). Hebrew renders right-to-left; English
renders left-to-right. The language toggle (globe icon) persists the
choice in `localStorage`, and every built-in location has both an English
and a Hebrew name.

## Getting started

Install dependencies and start the dev server:

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

### Running tests

```bash
npm test
```

This runs the full suite, including:

- `src/game/gameLogic.test.js` — role assignment, spy-count validation,
  location picking (with injected/deterministic RNGs so results are
  reproducible), and that spies never receive the location while regular
  players always share the exact same one.
- `src/data/locations.test.js` — catalog integrity and EN/HE name lookup.
- `src/store/reducers/settingsReducer.test.js` — player/spy bounds and
  custom-location add/remove/deduplication.
- `src/store/persistence.test.js` — settings round-trip through
  `localStorage`, including corrupted-data handling.
- `src/components/SingleDeviceGame/SingleDeviceGame.test.js` — the private
  reveal/hide flow, that the next player's role never appears
  automatically, the neutral discussion screen, and round resets.

### Building for production

```bash
npm run build
```

Outputs an optimized build to the `build/` folder.

## Project structure (relevant parts)

```
src/
  data/locations.js          Built-in location catalog (EN/HE)
  game/gameLogic.js          Pure game rules: shuffle, validation,
                              role assignment, location picking, reveals
  store/
    reducers/settingsReducer.js  players / spies / customLocations
    persistence.js               localStorage load/save helpers
  components/
    SingleDevice/               Toggles between Settings and Game
    SingleDeviceSettings/       Player/spy steppers, custom locations
    SingleDeviceGame/           Pass-device reveal/hide + discussion screen
    AddPlaces/, InputPopUp/     Custom-location UI
```

Game logic is kept separate from the React components so it can be unit
tested independently of rendering.

## Current limitations / possible future features

- **Multiplayer rooms**: "Create Room" is visible in the menu but disabled
  ("Coming soon") — there is no server, room codes, or real-time sync yet.
- **No timer, voting, or scoring**: rounds only handle secret role/location
  distribution; discussion, voting, and a winner screen are not
  implemented.
- **No round history**: past locations/roles aren't recorded beyond the
  short anti-repeat window used to avoid back-to-back repeats.
- **Build tooling**: this app still uses Create React App (`react-scripts`
  5), which is in maintenance mode; migrating to Vite would be a
  reasonable future improvement but wasn't required here.
