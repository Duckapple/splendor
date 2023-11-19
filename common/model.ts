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

export type CardDecks = Record<'high' | 'middle' | 'low' | 'persons', Card[]>;
export type IdDecks = Record<'high' | 'middle' | 'low' | 'persons', number[]>;

export type Player = {
	reserved: number[];
	cards: number[];
	tokens: Record<Color, number>;
};

export type ID = string;

export type GameState = {
	id: ID;
	piles: IdDecks;
	shown: IdDecks;
	tokens: Record<Color, number>;
	turn: 0 | 1 | 2 | 3;
};

export type ShownGameState = Omit<GameState, 'piles' | 'players'> & {
	players: Player[];
};

export type Action = InnerAction & {
	gameId: ID;
	userId: ID;
	timestamp: Date;
};

export type InnerAction = BuyCard | TakePerson | TakeTokens | Reserve;

export type BuyCard = {
	type: 'BUY_CARD';
	data: {
		row: 'high' | 'middle' | 'low' | 'reserve';
		i: number;
		card: number;
		tokens: [number, ...Card['cost']];
	};
};

export type TakePerson = {
	type: 'TAKE_PERSON';
	data: { i: 0 | 1 | 2 | 3 | 4; card: number };
};

export type TakeTokens = {
	type: 'TAKE_TOKENS';
	data: { tokens: [Color, Color, Color] | [Color, Color] };
};

export type Reserve = {
	type: 'RESERVE';
	data: {
		row: 'high' | 'middle' | 'low';
		i: number;
		card: number;
		withToken: boolean;
	};
};
