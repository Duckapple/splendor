import { Card, CardDecks, GameState, IdDecks, Color as c } from "./model";
import { range, shuffled } from "./utils";

export const cards = {
  high: [
    { id: 0x80, p: 5, c: c.W, cost: [3, 0, 0, 0, 7] },
    { id: 0x81, p: 4, c: c.W, cost: [0, 0, 0, 0, 7] },
    { id: 0x82, p: 4, c: c.W, cost: [3, 0, 0, 3, 6] },
    { id: 0x83, p: 3, c: c.W, cost: [0, 3, 3, 5, 3] },
    { id: 0x84, p: 5, c: c.U, cost: [7, 3, 0, 0, 0] },
    { id: 0x85, p: 4, c: c.U, cost: [7, 0, 0, 0, 0] },
    { id: 0x86, p: 4, c: c.U, cost: [6, 3, 0, 0, 3] },
    { id: 0x87, p: 3, c: c.U, cost: [3, 0, 3, 3, 5] },
    { id: 0x88, p: 5, c: c.G, cost: [0, 7, 3, 0, 0] },
    { id: 0x89, p: 4, c: c.G, cost: [0, 7, 0, 0, 0] },
    { id: 0x8a, p: 4, c: c.G, cost: [3, 6, 3, 0, 0] },
    { id: 0x8b, p: 3, c: c.G, cost: [5, 3, 0, 3, 3] },
    { id: 0x8c, p: 5, c: c.R, cost: [0, 0, 7, 3, 0] },
    { id: 0x8d, p: 4, c: c.R, cost: [0, 0, 7, 0, 0] },
    { id: 0x8e, p: 4, c: c.R, cost: [0, 3, 6, 3, 0] },
    { id: 0x8f, p: 3, c: c.R, cost: [3, 5, 3, 0, 3] },
    { id: 0x90, p: 5, c: c.B, cost: [0, 0, 0, 7, 3] },
    { id: 0x91, p: 4, c: c.B, cost: [0, 0, 0, 7, 0] },
    { id: 0x92, p: 4, c: c.B, cost: [0, 0, 3, 6, 3] },
    { id: 0x93, p: 3, c: c.B, cost: [3, 3, 5, 3, 0] },
  ],
  middle: [
    { id: 0x40, p: 3, c: c.W, cost: [6, 0, 0, 0, 0] },
    { id: 0x41, p: 2, c: c.W, cost: [0, 0, 0, 5, 0] },
    { id: 0x42, p: 2, c: c.W, cost: [0, 0, 0, 5, 3] },
    { id: 0x43, p: 2, c: c.W, cost: [0, 0, 1, 4, 2] },
    { id: 0x44, p: 1, c: c.W, cost: [2, 3, 0, 3, 0] },
    { id: 0x45, p: 1, c: c.W, cost: [0, 0, 3, 2, 2] },
    { id: 0x46, p: 3, c: c.U, cost: [0, 6, 0, 0, 0] },
    { id: 0x47, p: 2, c: c.U, cost: [0, 5, 0, 0, 0] },
    { id: 0x48, p: 2, c: c.U, cost: [5, 3, 0, 0, 0] },
    { id: 0x49, p: 2, c: c.U, cost: [2, 0, 0, 1, 4] },
    { id: 0x4a, p: 1, c: c.U, cost: [0, 2, 3, 0, 3] },
    { id: 0x4b, p: 1, c: c.U, cost: [0, 2, 2, 3, 0] },
    { id: 0x4c, p: 3, c: c.G, cost: [0, 0, 6, 0, 0] },
    { id: 0x4d, p: 2, c: c.G, cost: [0, 0, 5, 0, 0] },
    { id: 0x4e, p: 2, c: c.G, cost: [0, 5, 3, 0, 0] },
    { id: 0x4f, p: 2, c: c.G, cost: [4, 2, 0, 0, 1] },
    { id: 0x50, p: 1, c: c.G, cost: [3, 0, 2, 3, 0] },
    { id: 0x51, p: 1, c: c.G, cost: [2, 3, 0, 0, 2] },
    { id: 0x52, p: 3, c: c.R, cost: [0, 0, 0, 6, 0] },
    { id: 0x53, p: 2, c: c.R, cost: [0, 0, 0, 0, 5] },
    { id: 0x54, p: 2, c: c.R, cost: [3, 0, 0, 0, 5] },
    { id: 0x55, p: 2, c: c.R, cost: [1, 4, 2, 0, 0] },
    { id: 0x56, p: 1, c: c.R, cost: [0, 3, 0, 2, 3] },
    { id: 0x57, p: 1, c: c.R, cost: [2, 0, 0, 2, 3] },
    { id: 0x58, p: 3, c: c.B, cost: [0, 0, 0, 0, 6] },
    { id: 0x59, p: 2, c: c.B, cost: [5, 0, 0, 0, 0] },
    { id: 0x5a, p: 2, c: c.B, cost: [0, 0, 5, 3, 0] },
    { id: 0x5b, p: 2, c: c.B, cost: [0, 1, 4, 2, 0] },
    { id: 0x5c, p: 1, c: c.B, cost: [3, 0, 3, 0, 2] },
    { id: 0x5d, p: 1, c: c.B, cost: [3, 2, 2, 0, 0] },
  ],
  low: [
    { id: 0x00, p: 1, c: c.W, cost: [0, 0, 4, 0, 0] },
    { id: 0x01, c: c.W, cost: [0, 2, 2, 0, 1] },
    { id: 0x02, c: c.W, cost: [0, 1, 1, 1, 1] },
    { id: 0x03, c: c.W, cost: [0, 1, 2, 1, 1] },
    { id: 0x04, c: c.W, cost: [3, 1, 0, 0, 1] },
    { id: 0x05, c: c.W, cost: [0, 0, 0, 2, 1] },
    { id: 0x06, c: c.W, cost: [0, 2, 0, 0, 2] },
    { id: 0x07, c: c.W, cost: [0, 3, 0, 0, 0] },
    { id: 0x08, p: 1, c: c.U, cost: [0, 0, 0, 4, 0] },
    { id: 0x09, c: c.U, cost: [1, 0, 2, 2, 0] },
    { id: 0x0a, c: c.U, cost: [1, 0, 1, 1, 1] },
    { id: 0x0b, c: c.U, cost: [1, 0, 1, 2, 1] },
    { id: 0x0c, c: c.U, cost: [0, 1, 3, 1, 0] },
    { id: 0x0d, c: c.U, cost: [1, 0, 0, 0, 2] },
    { id: 0x0e, c: c.U, cost: [0, 0, 2, 0, 2] },
    { id: 0x0f, c: c.U, cost: [0, 0, 0, 0, 3] },
    { id: 0x10, p: 1, c: c.G, cost: [0, 0, 0, 0, 4] },
    { id: 0x11, c: c.G, cost: [0, 1, 0, 2, 2] },
    { id: 0x12, c: c.G, cost: [1, 1, 0, 1, 1] },
    { id: 0x13, c: c.G, cost: [1, 1, 0, 1, 2] },
    { id: 0x14, c: c.G, cost: [1, 3, 1, 0, 0] },
    { id: 0x15, c: c.G, cost: [2, 1, 0, 0, 0] },
    { id: 0x16, c: c.G, cost: [0, 2, 0, 2, 0] },
    { id: 0x17, c: c.G, cost: [0, 0, 0, 3, 0] },
    { id: 0x18, p: 1, c: c.R, cost: [4, 0, 0, 0, 0] },
    { id: 0x19, c: c.R, cost: [2, 0, 1, 0, 2] },
    { id: 0x1a, c: c.R, cost: [1, 1, 1, 0, 1] },
    { id: 0x1b, c: c.R, cost: [2, 1, 1, 0, 1] },
    { id: 0x1c, c: c.R, cost: [1, 0, 0, 1, 3] },
    { id: 0x1d, c: c.R, cost: [0, 2, 1, 0, 0] },
    { id: 0x1e, c: c.R, cost: [2, 0, 0, 2, 0] },
    { id: 0x1f, c: c.R, cost: [3, 0, 0, 0, 0] },
    { id: 0x20, p: 1, c: c.B, cost: [0, 4, 0, 0, 0] },
    { id: 0x21, c: c.B, cost: [2, 2, 0, 1, 0] },
    { id: 0x22, c: c.B, cost: [1, 1, 1, 1, 0] },
    { id: 0x23, c: c.B, cost: [1, 2, 1, 1, 0] },
    { id: 0x24, c: c.B, cost: [0, 0, 1, 3, 1] },
    { id: 0x25, c: c.B, cost: [0, 0, 2, 1, 0] },
    { id: 0x26, c: c.B, cost: [2, 0, 2, 0, 0] },
    { id: 0x27, c: c.B, cost: [0, 0, 3, 0, 0] },
  ],
  persons: [
    { id: 0xc0, p: 3, c: c.Y, cost: [4, 0, 0, 0, 4] },
    { id: 0xc1, p: 3, c: c.Y, cost: [0, 4, 4, 0, 0] },
    { id: 0xc2, p: 3, c: c.Y, cost: [0, 0, 4, 4, 0] },
    { id: 0xc3, p: 3, c: c.Y, cost: [0, 0, 0, 4, 4] },
    { id: 0xc4, p: 3, c: c.Y, cost: [4, 4, 0, 0, 0] },
    { id: 0xc5, p: 3, c: c.Y, cost: [0, 3, 3, 3, 0] },
    { id: 0xc6, p: 3, c: c.Y, cost: [3, 3, 0, 0, 3] },
    { id: 0xc7, p: 3, c: c.Y, cost: [0, 0, 3, 3, 3] },
    { id: 0xc8, p: 3, c: c.Y, cost: [3, 0, 0, 3, 3] },
    { id: 0xc9, p: 3, c: c.Y, cost: [3, 3, 3, 0, 0] },
  ],
} satisfies CardDecks;

function cardFromId(id: number): Card {
  if (id < 0x40) return cards.low[id];
  if (id < 0x80) return cards.middle[id - 0x40];
  if (id < 0xc0) return cards.high[id - 0x80];
  return cards.persons[id - 0xc0];
}

export function newGameState(id: string, playerCount: 2 | 3 | 4): GameState {
  const defaultTokenCounts = [0, 0, 4, 5, 7];
  const t = defaultTokenCounts[playerCount];
  const tokens = [t, t, t, t, t, 5] as const;

  const piles = {
    persons: shuffled(cards.persons.map(({ id }) => id)),
    high: shuffled(cards.high.map(({ id }) => id)),
    middle: shuffled(cards.middle.map(({ id }) => id)),
    low: shuffled(cards.low.map(({ id }) => id)),
  } satisfies IdDecks;

  const shown: IdDecks = { persons: [], high: [], middle: [], low: [] };

  for (let i = 0; i < playerCount + 1; i++) {
    shown["persons"].push(piles["persons"].pop()!);
  }

  for (let i = 0; i < 4; i++) {
    shown.low.push(piles.low.pop()!);
    shown.middle.push(piles.middle.pop()!);
    shown.high.push(piles.high.pop()!);
  }

  const players = range(playerCount).map(() => ({
    id: "lmao",
    cards: { high: [], middle: [], low: [], persons: [] },
    tokens: [0, 0, 0, 0, 0, 0] as const,
  }));

  return { id, shown, tokens, piles, players, turn: 0 };
}
