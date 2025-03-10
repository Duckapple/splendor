import { expect, it, describe } from 'bun:test';
import { cardFromId } from '../defaults';
import { canAfford, performAction } from '../logic';
import { Action, Card, GamePhase, GameState, IdDecks, InnerAction, Player } from '../model';
import winSnapshotTest from './win.snapshot.test';

describe('performAction.buyCard', () => {
	// +---------+
	// | Premise |
	// +---------+

	const game: GameState = {
		id: 'abc-123',
		shown: { low: [99, 99, 0, 99], persons: [0xc0, 0xc1, 0xc2, 0xc3, 0xc4] } as IdDecks,
		piles: { low: [1] } as IdDecks,
		tokens: [0, 0, 0, 0, 0, 0],
		turn: 0,
		playerCount: 4,
	} as GameState;
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
			shown: { low: [99, 99, 1, 99], persons: [0xc0, 0xc1, 0xc2, 0xc3, 0xc4] },
			tokens: [...cardFromId(0).cost, 0],
			turn: 1,
		} as unknown as GameState,
		player: {
			tokens: [0, 0, 0, 0, 0, 0],
			cards: [0],
			reserved: [],
		} as Player,
	};

	// #region Tests

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
			expect(res.value).toEqual({
				game: { ...result.game, tokens: [0, 0, 0, 0, 0, 0] },
				player: { ...result.player, cards: [...cards, 0] },
			});
	});

	it('can buy a card from both', () => {
		const localAction = { ...action, data: { ...action.data } };
		localAction.data.tokens = [0, 0, 2, 0, 0, 0];

		const localPlayer: Player = { ...player, tokens: [0, 0, 2, 0, 0, 0] };
		const cards = [0x11, 0x11];
		localPlayer.cards = [...cards];

		const res = performAction(structuredClone(game), localPlayer, localAction);

		if (res.isErr()) expect(res.error).toBeUndefined();

		expect(res.unwrapOr({})).toEqual({
			game: { ...result.game, tokens: [0, 0, 2, 0, 0, 0] },
			player: { ...result.player, cards: [...cards, 0] },
		});
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
			expect(res.value).toEqual({
				game: { ...result.game, tokens: localAction.data.tokens },
				player: { ...result.player, cards: [...cards, 0] },
			});
	});

	// #region edges

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

		if (res.isOk()) return expect(res.value).toBeUndefined();

		expect(res.error.data).toEqual({ type: 'BUY_CARD', playerTokens: [0, 0, -2, 0, 0, 0] });
	});

	describe('person', () => {
		// #region person
		it('hands the player the person they want when earned', () => {
			const cards = [1, 1, 1, 0x20, 0x20, 0x20, 0x20];
			const res = performAction(
				game,
				{ ...player, cards },
				{
					...action,
					data: { ...action.data, person: { id: game.shown.persons[0] } },
				}
			);
			if (res.isErr()) expect(res.error).toBeUndefined();
			if (res.isOk()) {
				expect(res.value).toEqual({
					game: {
						...result.game,
						shown: { ...result.game.shown, persons: result.game.shown.persons.slice(1) },
					},
					player: {
						...result.player,
						cards: [...cards, action.data.card, result.game.shown.persons[0]],
					},
				});
			}
		});

		it('hands the player the person they want when multiple earned', () => {
			const cards = [1, 1, 1, 0x20, 0x20, 0x20, 0x20, 0x08, 0x08, 0x08, 0x08];
			const res = performAction(
				game,
				{ ...player, cards },
				{
					...action,
					data: { ...action.data, person: { id: game.shown.persons[4] } },
				}
			);
			if (res.isErr()) expect(res.error).toBeUndefined();
			if (res.isOk()) {
				expect(res.value).toEqual({
					game: {
						...result.game,
						shown: { ...result.game.shown, persons: result.game.shown.persons.slice(0, 4) },
					},
					player: {
						...result.player,
						cards: [...cards, action.data.card, result.game.shown.persons[4]],
					},
				});
			}
		});

		it('can not hand the player the person they want when none earned', () => {
			const res = performAction(game, player, {
				...action,
				data: { ...action.data, person: { id: game.shown.persons[0] } },
			});
			if (res.isOk()) expect(res.value).toBeUndefined();
			if (res.isErr()) {
				expect(res.error.data).toEqual({ code: 'PERSON', type: 'BUY_CARD' });
			}
		});

		it('can not hand the player a person if they do not claim', () => {
			const cards = [1, 1, 1, 0x20, 0x20, 0x20, 0x20];
			const res = performAction(game, { ...player, cards }, action);
			if (res.isOk()) expect(res.value).toBeUndefined();
			if (res.isErr()) {
				expect(res.error.data).toEqual({ code: 'PERSON', type: 'BUY_CARD' });
			}
		});
	});

	// #region Win
	it('can win the game', () => {
		let { game: localGame, players: localPlayers } = structuredClone(winSnapshotTest);
		let localAction: Action = {
			type: 'BUY_CARD',
			gameId: localGame.id,
			userId: localPlayers[0].userId,
			timestamp: new Date(),
			data: { row: 'middle', tokens: [0, 0, 0, 0, 0, 0], i: 3, card: 0x43 },
		};
		const res = performAction(localGame, localPlayers[0], localAction);
		if (res.isErr()) expect(res.error).toBeUndefined();
		if (res.isOk()) {
			expect(res.value.player.cards?.reduce((acc, card) => acc + cardFromId(card).p, 0)).toBe(15);
			expect(res.value.game.phase).toBe(GamePhase.ENDING);
			localGame = { ...localGame, ...res.value.game };
			localPlayers[0] = { ...localPlayers[0], ...res.value.player };
			localAction = {
				...localAction,
				userId: localPlayers[1].userId,
				data: { card: 0x45, tokens: [0, 0, 0, 0, 0, 0], row: 'middle', i: 2 },
			};
			const res2 = performAction(localGame, localPlayers[1], localAction);
			if (res2.isErr()) expect(res2.error).toBeUndefined();
			if (res2.isOk()) {
				expect(res2.value.player.cards?.reduce((acc, card) => acc + cardFromId(card).p, 0)).toBe(5);
				expect(res2.value.game.phase).toBe(GamePhase.FINISHED);
			}
		}
	});
});

describe('canAfford', () => {
	it('bad case 1', () => {
		const card: Card = cardFromId(14);
		const localPlayer: Player = { cards: [0, 1, 2, 3], reserved: [], tokens: [2, 0, 0, 0, 0, 1] };

		const result = canAfford(card, localPlayer, [0, 0, 0, 0, 0, 0]);

		if (result.isOk()) return expect(result.value).toBeUndefined();

		expect(result.error).toEqual({ cost: card.cost });
	});
});
