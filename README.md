# Spyfall

A browser-based, pass-the-device version of **Spyfall** for people playing
together in the same room. It supports English and Hebrew, configurable
round settings, custom locations, and offline installation as a PWA.

## How to play

1. Open the game on one phone, tablet, or computer.
2. Choose the number of players, spies, and timer duration.
3. Optionally add custom locations, then select **Start Game**.
4. Pass the device around. Each player taps only their numbered card.
5. The card opens privately:
   - regular players see the shared secret location;
   - spies see **"You are the Spy."**
6. The player selects **"Got it, hide card"** before passing the device.
   Viewed cards are locked during this initial reveal phase.
7. After everyone has viewed their card, discussion begins. Players can tap
   their own card and hold the reveal button for a private reminder.
8. The clock is visible throughout the round. It can be paused, resumed, or
   stopped. At `00:00`, the game displays **"Time's up!"** without exposing
   any roles or locations.
9. Select **New round** to reshuffle roles and choose another location.

The locations button opens a searchable reference list containing all
built-in and custom locations.

## Privacy

Secret information is shown only inside the selected player's reveal
dialog. Closing the dialog removes the secret from view before the device
is passed. The card grid, discussion screen, timer, and locations reference
never identify the spy or reveal the active location.

## Settings and persistence

Redux stores the player count, spy count, timer duration, and custom
locations. These settings persist in `localStorage`, so they survive page
refreshes.

Custom locations:

- must contain 2–30 characters;
- cannot duplicate an existing built-in or custom location;
- are included in future rounds;
- can be removed from the settings screen.

Built-in locations are defined in
[`src/data/locations.js`](src/data/locations.js), with English and Hebrew
names.

## Languages

The language selector supports English (LTR) and Hebrew (RTL) through
`i18next`. The document direction updates automatically when the language
changes.

## Offline PWA

The production build includes a Workbox service worker that precaches the
game bundle, styles, icons, and manifest. After the first successful online
load, the installed game can launch and run offline. Player settings remain
available through browser storage.

## Local development

Requirements: Node.js and npm.

```bash
npm install
npm start
```

Open [http://localhost:3000/single](http://localhost:3000/single).

## Tests

```bash
npm test -- --watchAll=false
```

The tests cover game rules, location data, persisted settings, timer
behavior, private card reveals, discussion reminders, and round resets.

## Production build

```bash
npm run build
```

This creates the optimized `build/` directory, bundles the service worker,
and injects the precache manifest.

GitHub Pages deployment is available through:

```bash
npm run deploy
```

Before deploying from a fork, update the `homepage` field in `package.json`
to the fork's GitHub Pages URL.

## Project structure

```text
public/
  manifest.json                     PWA metadata and icons
scripts/
  generate-sw.js                    Service-worker build and precache step
src/
  data/locations.js                 Built-in EN/HE location catalog
  game/gameLogic.js                 Pure game rules and validation
  components/
    NavBar/                         Language selector and locations access
    LocationsModal/                 Searchable location reference
    SingleDeviceSettings/           Player, spy, timer, and location settings
    SingleDeviceGame/               Card grid, private reveal, and timer
  hooks/useLocationSearch.js        Shared location filtering
  store/
    reducers/settingsReducer.js     Persistent game settings
    persistence.js                  localStorage load/save
  service-worker.js                 Workbox offline behavior
  serviceWorkerRegistration.js      Browser service-worker registration
```

## Current limitations

- Multiplayer rooms are not implemented; the game is local,
  pass-the-device play only.
- Voting, scoring, and winner screens are handled by the players, not the
  app.
- There is no full round history.
- The project still uses Create React App 5, which is no longer actively
  maintained.
