import { expect, it, describe } from 'bun:test';
import { performAction } from '../logic';
import { Color, GameState, IdDecks, InnerAction, Player } from '../model';

describe('performAction.reserve', () => {
	// +---------+
	// | Premise |
	// +---------+

	const game: GameState = {
		id: 'abc-123',
		shown: { low: [99, 99, 0, 99] } as IdDecks,
		piles: { low: [1] } as IdDecks,
		tokens: [0, 0, 0, 0, 0, 4],
		turn: 0,
		playerCount: 4,
	};
	const player: Player = {
		tokens: [0, 0, 0, 0, 0, 0],
		cards: [],
		reserved: [],
	};
	const action = {
		type: 'RESERVE',
		data: {
			card: 0,
			i: 2,
			row: 'low',
		},
	} satisfies InnerAction;

	const result = {
		game: {
			piles: { low: [] },
			shown: { low: [99, 99, 1, 99] },
			tokens: [0, 0, 0, 0, 0, 3],
			turn: 1,
		} as any,
		player: {
			tokens: [0, 0, 0, 0, 0, 1],
			reserved: [0],
		} as Player,
	};

	// +-------+
	// | Tests |
	// +-------+

	it('can reserve a card via the sane route', () => {
		const res = performAction(game, player, action);

		if (res.isErr()) expect(res.error).toBeUndefined();

		expect(res.isOk()).toBe(true);

		if (res.isOk()) expect(res.value).toEqual(result);
	});

	it('can reserve a card without getting gold', () => {
		const tokens = [0, 0, 0, 0, 0, 0] as typeof game.tokens;
		const res = performAction({ ...game, tokens }, player, action);

		if (res.isErr()) expect(res.error).toBeUndefined();

		expect(res.isOk()).toBe(true);

		if (res.isOk())
			expect(res.value).toEqual({
				game: { ...result.game, tokens },
				player: { ...result.player, tokens },
			});
	});

	it('can reserve a card, get gold and return a token', () => {
		const res = performAction(
			{ ...game, tokens: [0, 0, 0, 0, 0, 1] },
			{ ...player, tokens: [0, 3, 3, 3, 1, 0] },
			{ ...action, data: { ...action.data, returnToken: Color.B } }
		);

		if (res.isErr()) expect(res.error).toBeUndefined();

		expect(res.isOk()).toBe(true);

		if (res.isOk())
			expect(res.value).toEqual({
				game: { ...result.game, tokens: [0, 0, 0, 0, 1, 0] },
				player: { ...result.player, tokens: [0, 3, 3, 3, 0, 1] },
			});
	});

	it("can not reserve returning a token they don't hold", () => {
		const res = performAction(
			{ ...game, tokens: [0, 0, 0, 0, 0, 1] },
			{ ...player, tokens: [1, 3, 3, 3, 0, 0] },
			{ ...action, data: { ...action.data, returnToken: Color.B } }
		);

		if (res.isOk()) expect(res.value).toBeUndefined();

		expect(res.isErr()).toBe(true);

		if (res.isErr()) expect(res.error.data).toEqual({ type: 'RESERVE', code: 'INVALID_RETURN' });
	});

	it('can not reserve and take token not returning when return was warranted', () => {
		const res = performAction(
			{ ...game, tokens: [0, 0, 0, 0, 0, 1] },
			{ ...player, tokens: [1, 3, 3, 3, 0, 0] },
			{ ...action, data: { ...action.data } }
		);

		if (res.isOk()) expect(res.value).toBeUndefined();

		expect(res.isErr()).toBe(true);

		if (res.isErr())
			expect(res.error.data).toEqual({ type: 'RESERVE', code: 'TOO_FEW_FOR_RETURN' });
	});

	it('can not reserve and return when not warranted', () => {
		const res = performAction(
			{ ...game, tokens: [0, 0, 0, 0, 0, 0] },
			{ ...player, tokens: [1, 3, 3, 3, 0, 0] },
			{ ...action, data: { ...action.data, returnToken: Color.B } }
		);

		if (res.isOk()) expect(res.value).toBeUndefined();

		expect(res.isErr()).toBe(true);

		if (res.isErr()) expect(res.error.data).toEqual({ type: 'RESERVE', code: 'INVALID_RETURN' });
	});

	it('can not reserve with wrong card', () => {
		const res = performAction(game, player, { ...action, data: { ...action.data, card: 99 } });

		if (res.isOk()) expect(res.value).toBeUndefined();

		expect(res.isErr()).toBe(true);

		if (res.isErr()) expect(res.error.data).toEqual({ type: 'RESERVE', code: 'INVALID_CARD' });
	});
});
