# portaLumi demo

Frontend-only interactive concept demo built on the existing Ionic 9 + Angular 22 project.

## What this branch contains

- 12-step clickable user flow
- portaLumi visual system
- no database
- no Laravel/API dependency for the demo route
- no real AI
- fake program-generation step
- two predefined JSON scenarios: confidence/focus and relationships/communication
- session-persisted demo selections

## Run

```bash
nvm use 22
npm install
npm start
```

Open:

```text
http://localhost:4200
```

The app redirects directly to `/demo/1`.

## Demo data

All program content is loaded from:

```text
src/assets/demo/flows.json
```

This lets the demo behave like a personalized app while remaining completely deterministic and offline-friendly.

## Branch purpose

This is intentionally a visual/product demo. The existing Laravel backend remains in the repository, but the demo flow does not call it.
