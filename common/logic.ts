import { type Err, err, type Ok, ok, type Result } from 'neverthrow';
import type { Card, GameState, InnerAction, Player, TokenHold } from './model';
import { Color } from './model';
import { cardFromId } from './defaults';
import { pick, sum } from './utils';

type BuyCardError = { type: 'BUY_CARD' } & (
	| { cost: Card['cost'] }
	| { playerTokens: [number, ...Card['cost']] }
	| { code: 'PERSON' | 'PERSON_INDEX' }
);

type TakeTokensError = {
	type: 'TAKE_TOKENS';
	code:
		| 'DUPLICATE_TOO_FEW'
		| 'DUPLICATE_TOO_MANY'
		| 'YELLOW'
		| 'NOT_ENOUGH'
		| 'TOO_MANY'
		| 'TOO_FEW_FOR_RETURN';
};

type ReserveError = {
	type: 'RESERVE';
	code: 'TOO_MANY' | 'TOO_FEW_FOR_RETURN' | 'INVALID_CARD' | 'INVALID_RETURN';
};

type ActionError = {
	message: string;
	status?: number;
	data?: BuyCardError | TakeTokensError | ReserveError;
};

export function performAction(
	game: GameState,
	player: Player,
	action: InnerAction
): Result<{ game: Partial<GameState>; player: Partial<Player> }, ActionError> {
	game = structuredClone(game);
	game.turn = ((game.turn + 1) % game.playerCount) as GameState['turn'];
	player = structuredClone(player);
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
				game.tokens[i2] += action.data.tokens[i2];
			}

			const earnedPeople = game.shown.persons
				.map((personId, index) => [personId, index] as const)
				.filter(([personId]) => {
					const person = cardFromId(personId);
					const x = canAfford(person, player, [0, 0, 0, 0, 0, 0]);
					return x.isOk();
				});

			if ((earnedPeople.length === 0) === (action.data.person != null)) {
				const should = earnedPeople.length === 0 ? 'Cannot' : 'Should';
				const not = should ? 'not ' : '';
				return err({
					message: `${should} claim person when ${not}earned`,
					data: { type: 'BUY_CARD', code: 'PERSON' },
				});
			}

			const chosen = earnedPeople.find(
				([personId, i]) => action.data.person?.i === i && action.data.person?.id === personId
			);

			if (chosen == null && action.data.person != null)
				return err({
					message: 'Did not choose an earned person',
					data: { type: 'BUY_CARD', code: 'PERSON_INDEX' },
				});

			if (chosen != null) {
				game.shown.persons.splice(chosen[1], 1);
				player.cards.push(chosen[0]);
			}

			return ok({
				game: pick(game, 'piles', 'shown', 'turn', 'tokens'),
				player: pick(player, 'cards', 'reserved', 'tokens'),
			});
		case 'TAKE_TOKENS':
			const tokens = action.data.tokens;

			const counts = [0, 0, 0, 0, 0, 0];
			for (const color of tokens) {
				counts[color] += 1;
			}

			if (sum(counts) + sum(player.tokens) <= 10 && action.data.returned != null)
				return err({
					message: 'Cannot return when not at token limit',
					data: { type: 'TAKE_TOKENS', code: 'TOO_FEW_FOR_RETURN' },
				});

			const returnCounts = [0, 0, 0, 0, 0, 0];
			for (const color of action.data.returned ?? []) {
				returnCounts[color] += 1;
			}

			if (sum(counts) + sum(player.tokens) - sum(returnCounts) > 10)
				return err({
					message: 'Cannot end up with more tokens than 10',
					data: { type: 'TAKE_TOKENS', code: 'TOO_MANY' },
				});

			if (counts[Color.Y] > 0)
				return err({
					message: 'Cannot take yellow tokens',
					data: { type: 'TAKE_TOKENS', code: 'YELLOW' },
				});

			if (tokens.length === 3 && counts.some((count) => count >= 2))
				return err({
					message: 'Cannot take like tokens when taking three tokens',
					data: { type: 'TAKE_TOKENS', code: 'DUPLICATE_TOO_MANY' },
				});

			for (let i = 0; i < game.tokens.length; i++) {
				if (counts[i] > 1 && game.tokens[i] < 4)
					return err({
						message: 'Cannot take like tokens when less than 4 left',
						data: { type: 'TAKE_TOKENS', code: 'DUPLICATE_TOO_FEW' },
					});
				game.tokens[i] -= counts[i] - returnCounts[i];
				player.tokens[i] += counts[i] - returnCounts[i];
			}

			if (game.tokens.some((value) => value < 0))
				return err({
					message: 'Cannot take more tokens than what is left',
					data: { type: 'TAKE_TOKENS', code: 'NOT_ENOUGH' },
				});

			return ok({ game: pick(game, 'tokens', 'turn'), player: pick(player, 'tokens') });
		case 'RESERVE':
			if (player.reserved.length >= 3)
				return err({
					message: 'Cannot have more than 3 cards reserved at once',
					data: { type: 'RESERVE', code: 'TOO_MANY' },
				});

			const didNotReturnWhenWarranted =
				(sum(player.tokens) === 10) === (action.data.returnToken == null);

			if (game.tokens[Color.Y] > 0 && didNotReturnWhenWarranted)
				return err({
					message: 'Need to return token when going over 10 tokens',
					data: { type: 'RESERVE', code: 'TOO_FEW_FOR_RETURN' },
				});

			if (action.data.returnToken != null && player.tokens[action.data.returnToken] <= 0)
				return err({
					message: 'Need to return a token you hold',
					data: { type: 'RESERVE', code: 'INVALID_RETURN' },
				});

			if (game.shown[action.data.row][action.data.i] !== action.data.card)
				return err({
					message: 'Card was not on position',
					data: { type: 'RESERVE', code: 'INVALID_CARD' },
				});

			const newCard = game.piles[action.data.row].pop();

			game.shown[action.data.row].splice(action.data.i, 1);

			if (newCard != null) game.shown[action.data.row].splice(action.data.i, 0, newCard);

			player.reserved.push(action.data.card);

			if (game.tokens[Color.Y] !== 0) {
				game.tokens[Color.Y] -= 1;
				player.tokens[Color.Y] += 1;
			}

			if (action.data.returnToken != null) {
				game.tokens[action.data.returnToken] += 1;
				player.tokens[action.data.returnToken] -= 1;
			}

			return ok({
				game: pick(game, 'piles', 'shown', 'tokens', 'turn'),
				player: pick(player, 'reserved', 'tokens'),
			});
	}
}

type CanAfford =
	| Ok<true, never>
	| Err<never, { cost: Card['cost'] } | { playerTokens: [number, ...Card['cost']] }>;

export function canAfford(card: Card, player: Player, tokens: Record<Color, number>): CanAfford {
	const cost = [...card.cost] as Card['cost'];
	const playerTokens = [...player.tokens] as TokenHold;

	for (let i = 0; i < 6; i++) {
		const i2 = i as Color;
		playerTokens[i2] -= tokens[i2];
	}

	if (playerTokens.some((value) => value < 0)) return err({ playerTokens });

	const playerBonus = getBonusFromCards(player.cards);

	for (let i = 0; i < cost.length; i++) {
		cost[i] -= playerBonus[i];
	}

	for (let i = 0; i < 5; i++) {
		const i2: Exclude<Color, Color.Y> = i;
		cost[i2] -= tokens[i2];
		cost[i2] = Math.max(0, cost[i2]);
	}

	if (sum(cost) === tokens[Color.Y]) return ok(true);

	return err({ cost });
}

export function getBonusFromCards(cardIds: number[]) {
	const res = [0, 0, 0, 0, 0, 0] as TokenHold;

	for (const card of cardIds) {
		const c = cardFromId(card).c;
		if (c !== Color.Y) res[c] += 1;
	}

	return res;
}
