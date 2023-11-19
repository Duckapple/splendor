import { expect, it, describe } from 'bun:test';
import { cardFromId } from '../defaults';
import { performAction } from '../logic';
import { InnerAction, Player } from '../model';

describe('performAction.buyCard', () => {
	// +---------+
	// | Premise |
	// +---------+

	const game: any = {
		shown: { low: [99, 99, 0, 99] },
		piles: { low: [1] },
	};
	const player: Player = {
		tokens: [...cardFromId(0).cost, 0],
		cards: [],
		reserved: [],
	};
	const action = {
		type: 'BUY_CARD',
		data: {
			card: 0,
			i: 2,
			row: 'low',
			tokens: [...cardFromId(0).cost, 0],
		},
	} satisfies InnerAction;

	const result = {
		game: {
			piles: { low: [] },
			shown: { low: [99, 99, 1, 99] },
		} as any,
		player: {
			tokens: [0, 0, 0, 0, 0, 0],
			cards: [0],
			reserved: [],
		} as Player,
	};

	// +-------+
	// | Tests |
	// +-------+

	it('can buy a card from tokens', () => {
		const res = performAction(
			structuredClone(game),
			structuredClone(player),
			structuredClone(action)
		);

		if (res.isErr()) expect(res.error).toBeUndefined();

		expect(res.isOk()).toBe(true);

		if (res.isOk()) expect(res.value).toEqual(result);
	});

	it('can buy a card from cards', () => {
		const localAction = { ...action, data: { ...action.data } };
		localAction.data.tokens = [0, 0, 0, 0, 0, 0];

		const localPlayer: Player = { ...player, tokens: [0, 0, 0, 0, 0, 0] };
		const cards = [0x11, 0x11, 0x11, 0x11];
		localPlayer.cards = [...cards];

		const res = performAction(structuredClone(game), localPlayer, localAction);

		if (res.isErr()) expect(res.error).toBeUndefined();

		expect(res.isOk()).toBe(true);

		if (res.isOk())
			expect(res.value).toEqual({ ...result, player: { ...result.player, cards: [...cards, 0] } });
	});

	it('can buy a card from both', () => {
		const localAction = { ...action, data: { ...action.data } };
		localAction.data.tokens = [0, 0, 2, 0, 0, 0];

		const localPlayer: Player = { ...player, tokens: [0, 0, 2, 0, 0, 0] };
		const cards = [0x11, 0x11];
		localPlayer.cards = [...cards];

		const res = performAction(structuredClone(game), localPlayer, localAction);

		if (res.isErr()) expect(res.error).toBeUndefined();

		expect(res.isOk()).toBe(true);

		if (res.isOk())
			expect(res.value).toEqual({ ...result, player: { ...result.player, cards: [...cards, 0] } });
	});

	it('can buy a card from both, with yellow', () => {
		const localAction = { ...action, data: { ...action.data } };
		localAction.data.tokens = [0, 0, 1, 0, 0, 1];

		const localPlayer: Player = { ...player, tokens: [0, 0, 1, 0, 0, 1] };
		const cards = [0x11, 0x11];
		localPlayer.cards = [...cards];

		const res = performAction(structuredClone(game), localPlayer, localAction);

		if (res.isErr()) expect(res.error).toBeUndefined();

		expect(res.isOk()).toBe(true);

		if (res.isOk())
			expect(res.value).toEqual({ ...result, player: { ...result.player, cards: [...cards, 0] } });
	});

	it('can not buy a card from too few tokens', () => {
		const localAction = { ...action, data: { ...action.data } };
		localAction.data.tokens = [0, 0, 1, 0, 0, 0];

		const localPlayer: Player = { ...player, tokens: [0, 0, 2, 0, 0, 0] };
		const cards = [0x11, 0x11];
		localPlayer.cards = [...cards];

		const res = performAction(structuredClone(game), localPlayer, localAction);

		if (res.isOk()) expect(res.value).toBeUndefined();

		expect(res.isErr()).toBe(true);

		if (res.isErr()) expect(res.error.data).toEqual({ type: 'BUY_CARD', cost: [0, 0, 1, 0, 0] });
	});

	it('can not buy a card from too few cards', () => {
		const localAction = { ...action, data: { ...action.data } };
		localAction.data.tokens = [0, 0, 0, 0, 0, 0];

		const localPlayer: Player = { ...player, tokens: [0, 0, 2, 0, 0, 0] };
		const cards = [0x11, 0x11];
		localPlayer.cards = [...cards];

		const res = performAction(structuredClone(game), localPlayer, localAction);

		if (res.isOk()) expect(res.value).toBeUndefined();

		expect(res.isErr()).toBe(true);

		if (res.isErr()) expect(res.error.data).toEqual({ type: 'BUY_CARD', cost: [0, 0, 2, 0, 0] });
	});

	it('can not overspend', () => {
		const localAction = { ...action, data: { ...action.data } };
		localAction.data.tokens = [0, 0, 4, 0, 0, 0];

		const localPlayer: Player = { ...player, tokens: [0, 0, 2, 0, 0, 0] };
		const cards = [];
		localPlayer.cards = [...cards];

		const res = performAction(structuredClone(game), localPlayer, localAction);

		if (res.isOk()) expect(res.value).toBeUndefined();

		expect(res.isErr()).toBe(true);

		if (res.isErr())
			expect(res.error.data).toEqual({ type: 'BUY_CARD', playerTokens: [0, 0, -2, 0, 0, 0] });
	});
});
