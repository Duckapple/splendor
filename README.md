# splendor

This is a port of Splendor into an asynchronous web-based board game.

Frontend is made with SvelteKit, backend is Google Cloud functions interacting with Neon DB using Drizzle ORM. Everything is written in TypeScript, using Bun as package manager and bundler for the cloud functions.

## Developing

To just run the Svelte app in dev mode, use:

```bash
bun run dev
```

But, since service workers have iffy support in dev mode, it might be better to reload manually with:

```bash
bun run build && bun run preview
```

## TODOs

- [ ] Common
  - [x] Error shape
  - [x] Update game state
    - [ ] Wind game state forward
    - [ ] Wind game state backward
  - [ ] Exodia
- [x] Backend
  - [x] Users
    - [x] Sessions
  - [x] Game
    - [x] New game
      - [x] Empty Game
      - [x] Game
    - [x] Perform action
    - [x] Send push to players
- [x] Frontend
  - [x] Login
    - [x] Sessions
  - [x] Overview
  - [x] Create
  - [x] Game
    - [x] Player board
    - [x] Common items
    - [x] Interactive elements to perform moves
  - [x] End
- [ ] Etc.
  - [x] Icon/logo
  - [ ] Fix metadata
  - [ ] Test a bunch
