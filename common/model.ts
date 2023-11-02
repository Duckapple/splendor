// prettier-ignore
export enum Color { W, U, G, R, B, Y }

export interface Card {
  /** Point value */
  p?: number;
  /** Color */
  c: Color;
  /** 5-Tuple of ordered color costs */
  cost: [number, number, number, number, number];
}

export type CardDecks = Record<"high" | "middle" | "low" | "persons", Card[]>;
export type IdDecks = Record<"high" | "middle" | "low" | "persons", number[]>;

export interface GameState {
  piles: IdDecks;
  shown: IdDecks;
  tokens: Record<Color, number>;
}

// 782.6
// 932.3
// 100.9
