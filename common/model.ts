// prettier-ignore
export enum Color { W, U, G, R, B, Y }

export interface Card {
	id: number;
	/** Point value */
	p: number;
	/** Color */
	c: Color;
	/** 5-Tuple of ordered color costs */
	cost: [number, number, number, number, number];
}

export type CardDecks = Record<'high' | 'middle' | 'low' | 'persons', Card[]>;
export type IdDecks = Record<'high' | 'middle' | 'low' | 'persons', number[]>;

export type TokenHold = [number, ...Card['cost']];

export type Player = {
	reserved: number[];
	cards: number[];
	tokens: TokenHold;
};

export type ID = string;

export enum GamePhase {
	PLAYING,
	ENDING,
	FINISHED,
}

export type GameState = {
	id: ID;
	piles: IdDecks;
	shown: IdDecks;
	tokens: TokenHold;
	turn: 0 | 1 | 2 | 3;
	playerCount: 1 | 2 | 3 | 4;
	phase: GamePhase;
};

export type ShownGameState = Omit<GameState, 'piles' | 'players'> & {
	players: Player[];
};

export type Action = InnerAction & {
	gameId: ID;
	userId: ID;
	timestamp: Date;
};

export type InnerAction = BuyCard | TakeTokens | Reserve;

export type BuyCard = {
	type: 'BUY_CARD';
	data: {
		row: 'high' | 'middle' | 'low' | 'reserve';
		i: number;
		card: number;
		tokens: TokenHold;
		person?: { i: 0 | 1 | 2 | 3 | 4; id: number };
	};
};

export type TakeTokens = {
	type: 'TAKE_TOKENS';
	data: {
		tokens: [Color, Color, Color] | [Color, Color] | [Color];
		returned?: [Color, Color, Color] | [Color, Color] | [Color];
	};
};

export type Reserve = {
	type: 'RESERVE';
	data: {
		row: 'high' | 'middle' | 'low';
		i: number;
		card: number;
		returnToken?: Color;
	};
};
