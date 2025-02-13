import { t, type Static } from 'elysia';
import { actionSchema } from './actions';
import { GamePhase } from '../model';

const idDecksSchema = t.Record(
	t.UnionEnum(['high', 'middle', 'low', 'persons']),
	t.Array(t.Number())
);

// prettier-ignore
const _tokensTuple = t.Tuple([
	t.Number(),	t.Number(),	t.Number(),
	t.Number(),	t.Number(),	t.Number(),
]);

const gameSchema = t.Object({
	id: t.String(),
	piles: idDecksSchema,
	shown: idDecksSchema,
	tokens: t.Array(t.Number(), { minItems: 6, maxItems: 6 }) as unknown as typeof _tokensTuple,
	turn: t.UnionEnum([0, 1, 2, 3]),
	playerCount: t.UnionEnum([1, 2, 3, 4]),
	phase: t.Enum(GamePhase),
});

export const playerSchema = t.Object({
	tokens: t.Array(t.Number(), { minItems: 6, maxItems: 6 }) as unknown as typeof _tokensTuple,
	userId: t.String(),
	gameId: t.String(),
	position: t.UnionEnum([0, 1, 2, 3]),
	reserved: t.Array(t.Number()),
	cards: t.Array(t.Number()),
});

export const stateUpdateSchema = t.Record(
	t.String(),
	t.Object({
		action: t.Intersect([
			actionSchema,
			t.Object({ gameId: t.String(), userId: t.String(), timestamp: t.Date() }),
		]),
		game: gameSchema,
		player: playerSchema,
	})
);

export type StateUpdate = Static<typeof stateUpdateSchema>;
