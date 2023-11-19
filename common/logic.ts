import { err, ok, type Result } from 'neverthrow';
import type { Card, GameState, InnerAction, Player } from './model';
import { Color } from './model';
import { cardFromId } from './defaults';
import { pick, sum } from './utils';

type BuyCardData = { type: 'BUY_CARD' } & (
	| { cost: Card['cost'] }
	| { playerTokens: [number, ...Card['cost']] }
);

type ActionError = {
	message: string;
	data?: BuyCardData;
};

export function performAction(
	game: GameState,
	player: Player,
	action: InnerAction
): Result<{ game: Partial<GameState>; player: Partial<Player> }, ActionError> {
	switch (action.type) {
		case 'BUY_CARD':
			if (action.data.row === 'reserve' && player.reserved[action.data.i] !== action.data.card) {
				return err({ message: 'Card is not reserved' });
			}
			if (
				action.data.row !== 'reserve' &&
				game.shown[action.data.row][action.data.i] !== action.data.card
			) {
				return err({ message: 'Card was not on position' });
			}

			const card = cardFromId(action.data.card);

			const afford = canAfford(card, player, action.data.tokens);

			if (afford.isErr()) {
				return err({ message: 'Cannot afford card', data: { type: 'BUY_CARD', ...afford.error } });
			}

			if (action.data.row === 'reserve') {
				player.reserved.splice(action.data.i, 1);
			} else {
				const newCard = game.piles[action.data.row].pop();

				game.shown[action.data.row].splice(action.data.i, 1);

				if (newCard != null) game.shown[action.data.row].splice(action.data.i, 0, newCard);
			}

			player.cards.push(card.id);

			for (let i = 0; i < action.data.tokens.length; i++) {
				const i2 = i as Color;
				player.tokens[i2] -= action.data.tokens[i2];
			}

			return ok({ game: pick(game, 'piles', 'shown'), player });
		case 'TAKE_PERSON':
			return ok({ game: {}, player: {} });
		case 'TAKE_TOKENS':
			return ok({ game: {}, player: {} });
		case 'RESERVE':
			return ok({ game: {}, player: {} });
	}
}

type CanAfford = Result<true, { cost: Card['cost'] } | { playerTokens: [number, ...Card['cost']] }>;

export function canAfford(card: Card, player: Player, tokens: Record<Color, number>): CanAfford {
	const cost = [...card.cost] as Card['cost'];
	const playerTokens = [...(player.tokens as [number, ...Card['cost']])] as [
		number,
		...Card['cost']
	];

	for (let i = 0; i < 6; i++) {
		const i2 = i as Color;
		playerTokens[i2] -= tokens[i2];
	}

	if (playerTokens.some((value) => value < 0)) return err({ playerTokens });

	for (const card of player.cards) {
		const c = cardFromId(card).c;
		if (c !== Color.Y) cost[c] -= 1;
	}

	for (let i = 0; i < 5; i++) {
		const i2: Exclude<Color, Color.Y> = i;
		cost[i2] -= tokens[i2];
	}

	if (sum(cost) === tokens[Color.Y]) return ok(true);

	return err({ cost });
}
