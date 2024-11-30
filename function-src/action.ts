import { AuthUser } from '../common/communication';
import { FunctionError } from './common/auth';
import { and, eq, gt } from 'drizzle-orm';
import { SplendorAction, SplendorGame, SplendorGamePlayer } from '../db/schema';
import { db } from './common/db';
import { actionSchema } from '../common/actions';
import { performAction } from '../common/logic';
import { omit } from '../common/utils';
import { GamePhase } from '../common/model';
import { t } from 'elysia';
import { Infer } from './common/type';

const getInput = t.Object({
	gameId: t.String(),
	since: t.Optional(t.Date()),
});

get.params = { query: getInput };
export async function get(user: AuthUser, req: Infer<typeof get.params>) {
	const { gameId, since } = req.query;

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

	return { message: 'Got actions', data: actions };
}

post.params = {
	query: t.Object({ gameId: t.String() }),
	body: actionSchema,
};
export async function post(user: AuthUser, req: Infer<typeof post.params>) {
	const { gameId } = req.query;
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
			.where(eq(SplendorGamePlayer.userId, user.id)),
		db.insert(SplendorAction).values(dbAction),
	]);

	const data = {
		game: omit({ ...dbRes.game, ...res.value.game }, 'piles'),
		player: { ...dbRes.player, ...res.value.player },
		action: dbAction,
	};

	return { message: 'Action performed', data };
}
