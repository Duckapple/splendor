import { GameState, Player } from '../model';

export default {
	game: {
		id: 'c0179ee0-e415-4439-8707-391c06899cee',
		shown: {
			persons: [],
			high: [141, 145, 130, 132],
			middle: [70, 90, 69, 67],
			low: [8, 35, 24, 23],
		},
		piles: {
			persons: [194, 196, 195, 198, 199, 193, 200],
			high: [136, 129, 147, 142, 138, 128, 139, 137, 134, 144, 143, 131, 135, 140, 133],
			middle: [
				91, 64, 85, 76, 75, 66, 72, 84, 86, 65, 89, 81, 71, 77, 78, 68, 80, 87, 92, 73, 93, 79, 88,
				74,
			],
			low: [],
		},
		tokens: [2, 1, 4, 3, 3, 5],
		turn: 0,
		playerCount: 2,
		phase: 0,
	} as GameState,
	players: [
		{
			userId: '2e42bfa4-f639-4b92-a801-1eef90c052c8',
			gameId: 'c0179ee0-e415-4439-8707-391c06899cee',
			position: 0,
			reserved: [146, 6],
			cards: [
				18, 10, 29, 3, 14, 4, 32, 34, 33, 37, 12, 16, 15, 26, 21, 30, 197, 2, 201, 5, 192, 38, 83,
			],
			tokens: [1, 0, 0, 1, 0, 0],
		},
		{
			userId: '18ce5138-b33a-4e5e-94da-9cfb9757993f',
			gameId: 'c0179ee0-e415-4439-8707-391c06899cee',
			position: 1,
			reserved: [],
			cards: [27, 25, 36, 20, 19, 13, 17, 28, 39, 0, 11, 22, 9, 7, 31, 82, 1],
			tokens: [1, 3, 0, 0, 1, 0],
		},
	] as (Player & Record<'userId' | 'gameId', string> & { position: number })[],
};
