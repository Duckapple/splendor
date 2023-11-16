// prettier-ignore
export enum Color { W, U, G, R, B, Y }

export interface Card {
  id: number;
  /** Point value */
  p?: number;
  /** Color */
  c: Color;
  /** 5-Tuple of ordered color costs */
  cost: [number, number, number, number, number];
}

export type CardDecks = Record<"high" | "middle" | "low" | "persons", Card[]>;
export type IdDecks = Record<"high" | "middle" | "low" | "persons", number[]>;

export type Player = {
  cards: IdDecks;
  tokens: Record<Color, number>;
};

export type ID = string;

export type GameState = {
  id: ID;
  piles: IdDecks;
  shown: IdDecks;
  tokens: Record<Color, number>;
  players: (Player & { id: ID })[];
  turn: 0 | 1 | 2 | 3;
};

export type ShownGameState = Omit<GameState, "piles" | "players"> & {
  players: Player[];
};

export type Action = (BuyCard | TakePerson | TakeTokens | Reserve) & {
  gameId: ID;
  playerId: ID;
};

export type BuyCard = {
  type: "buy_card";
  row: "high" | "middle" | "low" | "reserve";
  i: number;
  card: number;
  tokens: Record<Color, number>;
};

export type TakePerson = {
  type: "take_person";
  i: 0 | 1 | 2 | 3 | 4;
  card: number;
};

export type TakeTokens = {
  type: "take_tokens";
  tokens: [Color, Color, Color] | [Color, Color];
};

export type Reserve = {
  type: "reserve";
  card: number;
};
