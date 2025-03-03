import { expect, it, describe } from 'bun:test';
import { performAction } from '../logic';
import { GameState, InnerAction, Player } from '../model';

describe('performAction.takeTokens', () => {
	const game: GameState = {
		tokens: [7, 7, 7, 7, 7, 5],
		turn: 0,
		playerCount: 4,
	} as any;

	const player: Player = { cards: [], reserved: [], tokens: [0, 0, 0, 0, 0, 0] };

	const action: InnerAction = {
		type: 'TAKE_TOKENS',
		data: { tokens: [0, 1, 2] },
	};

	const result = {
		game: { tokens: [6, 6, 6, 7, 7, 5], turn: 1 } as Partial<GameState>,
		player: { tokens: [1, 1, 1, 0, 0, 0] } as Player,
	};

	// +-------+
	// | Tests |
	// +-------+

	it('can take tokens', () => {
		expect(performAction(game, player, action).unwrapOr({})).toEqual(result);
	});

	it('can take duplicate tokens', () => {
		const localAction = structuredClone(action);
		localAction.data.tokens = [0, 0];

		const res = performAction(
			{ tokens: [4, 4, 4, 4, 4, 5], turn: 0, playerCount: 4 } as GameState,
			player,
			localAction
		);

		if (res.isErr()) return expect(res.error).toBeUndefined();

		expect(res.value).toEqual({
			game: { tokens: [2, 4, 4, 4, 4, 5], turn: 1 },
			player: { tokens: [2, 0, 0, 0, 0, 0] },
		});
	});

	it('can take and return tokens', () => {
		const localAction = structuredClone(action);
		localAction.data.tokens = [0, 1, 2];
		localAction.data.returned = [3];

		const res = performAction(game, { ...player, tokens: [2, 1, 1, 2, 2, 0] }, localAction);

		if (res.isErr()) return expect(res.error).toBeUndefined();

		expect(res.value).toEqual({
			game: { tokens: [6, 6, 6, 8, 7, 5], turn: 1 },
			player: { tokens: [3, 2, 2, 1, 2, 0] },
		});
	});

	it('can not take duplicate tokens when too few left', () => {
		const localAction = structuredClone(action);
		localAction.data.tokens = [0, 0];

		const res = performAction(
			{ tokens: [3, 4, 4, 4, 4, 5], turn: 0, playerCount: 4 } as GameState,
			player,
			localAction
		);

		if (res.isOk()) return expect(res.value).toBeUndefined();

		expect(res.error.data).toEqual({ type: 'TAKE_TOKENS', code: 'DUPLICATE_TOO_FEW' });
	});

	it('can not take duplicate in take-three', () => {
		const localAction = structuredClone(action);
		localAction.data.tokens = [0, 0, 1];

		const res = performAction(
			{ tokens: [4, 4, 4, 4, 4, 5], turn: 0, playerCount: 4 } as GameState,
			player,
			localAction
		);

		if (res.isOk()) return expect(res.value).toBeUndefined();

		expect(res.error.data).toEqual({ type: 'TAKE_TOKENS', code: 'DUPLICATE_TOO_MANY' });
	});

	it('can not take when none left', () => {
		const localAction = structuredClone(action);
		localAction.data.tokens = [0, 1, 2];

		const res = performAction(
			{ tokens: [0, 4, 4, 4, 4, 5], turn: 0, playerCount: 4 } as GameState,
			player,
			localAction
		);

		if (res.isOk()) return expect(res.value).toBeUndefined();

		expect(res.error.data).toEqual({ type: 'TAKE_TOKENS', code: 'NOT_ENOUGH' });
	});

	it('can not take when too many at player', () => {
		const localAction = structuredClone(action);
		localAction.data.tokens = [0, 1, 2];

		const res = performAction(game, { ...player, tokens: [2, 1, 1, 2, 2, 0] }, localAction);

		if (res.isOk()) return expect(res.value).toBeUndefined();

		expect(res.error.data).toEqual({ type: 'TAKE_TOKENS', code: 'TOO_MANY' });
	});

	it('can not return when too few at player', () => {
		const localAction = structuredClone(action);
		localAction.data.tokens = [0, 1, 2];
		localAction.data.returned = [0];

		const res = performAction(game, { ...player, tokens: [2, 1, 1, 1, 2, 0] }, localAction);

		if (res.isOk()) return expect(res.value).toBeUndefined();

		expect(res.error.data).toEqual({ type: 'TAKE_TOKENS', code: 'TOO_FEW_FOR_RETURN' });
	});
});
