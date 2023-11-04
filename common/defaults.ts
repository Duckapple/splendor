import { CardDecks, GameState, IdDecks, Color as c } from "./model";
import { range, shuffled } from "./utils";

export const cards = {
  high: [
    { p: 5, c: c.W, cost: [3, 0, 0, 0, 7] },
    { p: 4, c: c.W, cost: [0, 0, 0, 0, 7] },
    { p: 4, c: c.W, cost: [3, 0, 0, 3, 6] },
    { p: 3, c: c.W, cost: [0, 3, 3, 5, 3] },
    { p: 5, c: c.U, cost: [7, 3, 0, 0, 0] },
    { p: 4, c: c.U, cost: [7, 0, 0, 0, 0] },
    { p: 4, c: c.U, cost: [6, 3, 0, 0, 3] },
    { p: 3, c: c.U, cost: [3, 0, 3, 3, 5] },
    { p: 5, c: c.G, cost: [0, 7, 3, 0, 0] },
    { p: 4, c: c.G, cost: [0, 7, 0, 0, 0] },
    { p: 4, c: c.G, cost: [3, 6, 3, 0, 0] },
    { p: 3, c: c.G, cost: [5, 3, 0, 3, 3] },
    { p: 5, c: c.R, cost: [0, 0, 7, 3, 0] },
    { p: 4, c: c.R, cost: [0, 0, 7, 0, 0] },
    { p: 4, c: c.R, cost: [0, 3, 6, 3, 0] },
    { p: 3, c: c.R, cost: [3, 5, 3, 0, 3] },
    { p: 5, c: c.B, cost: [0, 0, 0, 7, 3] },
    { p: 4, c: c.B, cost: [0, 0, 0, 7, 0] },
    { p: 4, c: c.B, cost: [0, 0, 3, 6, 3] },
    { p: 3, c: c.B, cost: [3, 3, 5, 3, 0] },
  ],
  middle: [
    { p: 3, c: c.W, cost: [6, 0, 0, 0, 0] },
    { p: 2, c: c.W, cost: [0, 0, 0, 5, 0] },
    { p: 2, c: c.W, cost: [0, 0, 0, 5, 3] },
    { p: 2, c: c.W, cost: [0, 0, 1, 4, 2] },
    { p: 1, c: c.W, cost: [2, 3, 0, 3, 0] },
    { p: 1, c: c.W, cost: [0, 0, 3, 2, 2] },
    { p: 3, c: c.U, cost: [0, 6, 0, 0, 0] },
    { p: 2, c: c.U, cost: [0, 5, 0, 0, 0] },
    { p: 2, c: c.U, cost: [5, 3, 0, 0, 0] },
    { p: 2, c: c.U, cost: [2, 0, 0, 1, 4] },
    { p: 1, c: c.U, cost: [0, 2, 3, 0, 3] },
    { p: 1, c: c.U, cost: [0, 2, 2, 3, 0] },
    { p: 3, c: c.G, cost: [0, 0, 6, 0, 0] },
    { p: 2, c: c.G, cost: [0, 0, 5, 0, 0] },
    { p: 2, c: c.G, cost: [0, 5, 3, 0, 0] },
    { p: 2, c: c.G, cost: [4, 2, 0, 0, 1] },
    { p: 1, c: c.G, cost: [3, 0, 2, 3, 0] },
    { p: 1, c: c.G, cost: [2, 3, 0, 0, 2] },
    { p: 3, c: c.R, cost: [0, 0, 0, 6, 0] },
    { p: 2, c: c.R, cost: [0, 0, 0, 0, 5] },
    { p: 2, c: c.R, cost: [3, 0, 0, 0, 5] },
    { p: 2, c: c.R, cost: [1, 4, 2, 0, 0] },
    { p: 1, c: c.R, cost: [0, 3, 0, 2, 3] },
    { p: 1, c: c.R, cost: [2, 0, 0, 2, 3] },
    { p: 3, c: c.B, cost: [0, 0, 0, 0, 6] },
    { p: 2, c: c.B, cost: [5, 0, 0, 0, 0] },
    { p: 2, c: c.B, cost: [0, 0, 5, 3, 0] },
    { p: 2, c: c.B, cost: [0, 1, 4, 2, 0] },
    { p: 1, c: c.B, cost: [3, 0, 3, 0, 2] },
    { p: 1, c: c.B, cost: [3, 2, 2, 0, 0] },
  ],
  low: [
    { p: 1, c: c.W, cost: [0, 0, 4, 0, 0] },
    { c: c.W, cost: [0, 2, 2, 0, 1] },
    { c: c.W, cost: [0, 1, 1, 1, 1] },
    { c: c.W, cost: [0, 1, 2, 1, 1] },
    { c: c.W, cost: [3, 1, 0, 0, 1] },
    { c: c.W, cost: [0, 0, 0, 2, 1] },
    { c: c.W, cost: [0, 2, 0, 0, 2] },
    { c: c.W, cost: [0, 3, 0, 0, 0] },
    { p: 1, c: c.U, cost: [0, 0, 0, 4, 0] },
    { c: c.U, cost: [1, 0, 2, 2, 0] },
    { c: c.U, cost: [1, 0, 1, 1, 1] },
    { c: c.U, cost: [1, 0, 1, 2, 1] },
    { c: c.U, cost: [0, 1, 3, 1, 0] },
    { c: c.U, cost: [1, 0, 0, 0, 2] },
    { c: c.U, cost: [0, 0, 2, 0, 2] },
    { c: c.U, cost: [0, 0, 0, 0, 3] },
    { p: 1, c: c.G, cost: [0, 0, 0, 0, 4] },
    { c: c.G, cost: [0, 1, 0, 2, 2] },
    { c: c.G, cost: [1, 1, 0, 1, 1] },
    { c: c.G, cost: [1, 1, 0, 1, 2] },
    { c: c.G, cost: [1, 3, 1, 0, 0] },
    { c: c.G, cost: [2, 1, 0, 0, 0] },
    { c: c.G, cost: [0, 2, 0, 2, 0] },
    { c: c.G, cost: [0, 0, 0, 3, 0] },
    { p: 1, c: c.R, cost: [4, 0, 0, 0, 0] },
    { c: c.R, cost: [2, 0, 1, 0, 2] },
    { c: c.R, cost: [1, 1, 1, 0, 1] },
    { c: c.R, cost: [2, 1, 1, 0, 1] },
    { c: c.R, cost: [1, 0, 0, 1, 3] },
    { c: c.R, cost: [0, 2, 1, 0, 0] },
    { c: c.R, cost: [2, 0, 0, 2, 0] },
    { c: c.R, cost: [3, 0, 0, 0, 0] },
    { p: 1, c: c.B, cost: [0, 4, 0, 0, 0] },
    { c: c.B, cost: [2, 2, 0, 1, 0] },
    { c: c.B, cost: [1, 1, 1, 1, 0] },
    { c: c.B, cost: [1, 2, 1, 1, 0] },
    { c: c.B, cost: [0, 0, 1, 3, 1] },
    { c: c.B, cost: [0, 0, 2, 1, 0] },
    { c: c.B, cost: [2, 0, 2, 0, 0] },
    { c: c.B, cost: [0, 0, 3, 0, 0] },
  ],
  persons: [
    { p: 3, c: c.Y, cost: [4, 0, 0, 0, 4] },
    { p: 3, c: c.Y, cost: [0, 4, 4, 0, 0] },
    { p: 3, c: c.Y, cost: [0, 0, 4, 4, 0] },
    { p: 3, c: c.Y, cost: [0, 0, 0, 4, 4] },
    { p: 3, c: c.Y, cost: [4, 4, 0, 0, 0] },
    { p: 3, c: c.Y, cost: [0, 3, 3, 3, 0] },
    { p: 3, c: c.Y, cost: [3, 3, 0, 0, 3] },
    { p: 3, c: c.Y, cost: [0, 0, 3, 3, 3] },
    { p: 3, c: c.Y, cost: [3, 0, 0, 3, 3] },
    { p: 3, c: c.Y, cost: [3, 3, 3, 0, 0] },
  ],
} satisfies CardDecks;

export function newGameState(playerCount: 2 | 3 | 4): GameState {
  const defaultTokenCounts = [0, 0, 4, 5, 7];
  const t = defaultTokenCounts[playerCount];
  const tokens = [t, t, t, t, t, 5] as const;

  const piles = {
    persons: shuffled(range(cards.persons.length)),
    high: shuffled(range(cards.high.length)),
    middle: shuffled(range(cards.middle.length)),
    low: shuffled(range(cards.low.length)),
  };

  const shown: IdDecks = { persons: [], high: [], middle: [], low: [] };

  for (let i = 0; i < playerCount + 1; i++) {
    shown["persons"].push(piles["persons"].pop()!);
  }

  for (let i = 0; i < 4; i++) {
    (["low", "middle", "high"] as const).forEach((k) =>
      shown[k].push(piles[k].pop()!)
    );
  }

  const players = range(playerCount).map(() => ({
    id: "lmao",
    cards: { high: [], middle: [], low: [], persons: [] },
    tokens: [0, 0, 0, 0, 0, 0] as const,
  }));

  const id = "xddd";

  return { id, shown, tokens, piles, players, turn: 0 };
}
