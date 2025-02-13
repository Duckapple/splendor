import type { AuthUser } from '../common/communication';
import { FunctionError } from './common/auth';
import { and, eq, gt } from 'drizzle-orm';
import { SplendorAction, SplendorGame, SplendorGamePlayer } from '../db/schema';
import { db } from './common/db';
import { actionSchema } from '../common/schema/actions';
import { performAction } from '../common/logic';
import { GamePhase, type Action, type GameState } from '../common/model';
import { t } from 'elysia';
import type { Infer } from './common/type';

get.params = {
	params: t.Object({ id: t.String() }),
	query: t.Object({
		since: t.Optional(t.Date()),
	}),
};
export async function get(user: AuthUser, req: Infer<typeof get.params>) {
	const { since } = req.query;
	const { id: gameId } = req.params;

	const [game] = await db
		.select({ id: SplendorGame.id })
		.from(SplendorGame)
		.innerJoin(SplendorGamePlayer, eq(SplendorGamePlayer.gameId, SplendorGame.id))
		.where(and(eq(SplendorGame.id, gameId), eq(SplendorGamePlayer.userId, user.id)));

	if (game == null) {
		throw new FunctionError(404, { message: 'Not Found' });
	}

	const conditions = [eq(SplendorAction.gameId, gameId)];
	if (since != null) {
		conditions.push(gt(SplendorAction.timestamp, since));
	}

	const actions = await db
		.select()
		.from(SplendorAction)
		.where(and(...conditions))
		.orderBy(SplendorAction.timestamp);

	return actions as Action[];
}

post.params = {
	body: actionSchema,
	params: t.Object({ id: t.String() }),
};
export async function post(user: AuthUser, req: Infer<typeof post.params>) {
	const { id: gameId } = req.params;
	const action = req.body;

	const [dbRes] = await db
		.select({ game: SplendorGame, player: SplendorGamePlayer })
		.from(SplendorGame)
		.innerJoin(SplendorGamePlayer, eq(SplendorGamePlayer.gameId, SplendorGame.id))
		.where(
			and(
				eq(SplendorGame.id, gameId),
				eq(SplendorGamePlayer.userId, user.id),
				eq(SplendorGame.turn, SplendorGamePlayer.position)
			)
		);

	if (dbRes == null) {
		throw new FunctionError(403, { message: 'Forbidden' });
	}

	if (dbRes.game.phase === GamePhase.FINISHED) {
		throw new FunctionError(403, { message: 'Game is finished' });
	}

	// This is the bread and butter, right here
	const res = performAction(dbRes.game, dbRes.player, action);

	if (res.isErr()) throw new FunctionError(res.error.status ?? 400, res.error);

	const dbAction: SplendorAction = { ...action, gameId, userId: user.id, timestamp: new Date() };

	await Promise.all([
		db.update(SplendorGame).set(res.value.game).where(eq(SplendorGame.id, gameId)),
		db
			.update(SplendorGamePlayer)
			.set(res.value.player)
			.where(and(eq(SplendorGamePlayer.userId, user.id), eq(SplendorGamePlayer.gameId, gameId))),
		db.insert(SplendorAction).values(dbAction),
	]);

	const data = {
		game: {
			...dbRes.game,
			...res.value.game,
			piles: mergeKeyLengths(res.value.game.piles, dbRes.game.piles),
		} as GameState,
		player: { ...dbRes.player, ...res.value.player } as SplendorGamePlayer,
		action: dbAction as Action,
	};

	return data;
}

function mergeKeyLengths<T extends Record<string, Array<unknown>>>(
	obj: NoInfer<Partial<T> | undefined>,
	fallback: T
) {
	const res = {} as { [K in keyof T]: { length: number } };
	for (const key of Object.keys(fallback)) {
		res[key as keyof T] = { length: (obj?.[key] ?? fallback[key]).length };
	}
	return res;
}
