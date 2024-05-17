# splendor

This is a port of Splendor into an asynchronous web-based board game.

Frontend is made with SvelteKit, backend is Google Cloud functions interacting with PlanetScale using Drizzle ORM. Everything is written in TypeScript, using Bun as package manager and bundler for the cloud functions.

## TODOs

- [ ] Common
  - [x] Error shape
  - [x] Update game state
    - [ ] Wind game state forward
    - [ ] Wind game state backward
  - [ ] Exodia
- [ ] Backend
  - [x] Users
    - [x] Sessions
  - [ ] Game
    - [x] New game
      - [x] Empty Game
      - [x] Game
    - [x] Perform action
    - [ ] Send push to players
- [ ] Frontend
  - [x] Login
    - [x] Sessions
  - [x] Overview
  - [ ] Create
  - [x] Game
    - [x] Player board
    - [x] Common items
    - [x] Interactive elements to perform moves
  - [ ] End
- [ ] Etc.
  - [x] Icon/logo
  - [ ] Fix metadata
  - [ ] Test a bunch
