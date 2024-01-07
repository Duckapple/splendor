import { and, eq } from 'drizzle-orm';
import { SplendorGame, SplendorGamePlayer, SplendorRoom as Room } from '../db/schema';
import { db } from './common/db';
import { FunctionError, Request, authedHandler, httpGuarded } from './common/httpGuarded';
import { AuthUser } from '../common/communication';
import { newGameState } from '../common/defaults';
import { mapValues, omit } from '../common/utils';

httpGuarded('game', {
	POST: authedHandler(post),
	GET: authedHandler(get),
});

async function post(user: AuthUser, req: Request) {
	const id = req.query.id;
	if (typeof id !== 'string') throw new FunctionError(400, { message: 'Bad room ID' });

	const [room, ...rest] = await db
		.select()
		.from(Room)
		.leftJoin(SplendorGamePlayer, eq(Room.id, SplendorGamePlayer.gameId))
		.where(and(eq(Room.id, id), eq(Room.ownerId, user.id), eq(Room.started, false)));

	if (room == null) throw new FunctionError(400, { message: 'Bad Request' });

	const game = newGameState(id, (rest.length + 1) as 1 | 2 | 3 | 4);

	await Promise.all([
		db.insert(SplendorGame).values(game),
		db.update(Room).set({ started: true }).where(eq(Room.id, id)),
	]);

	return { message: 'Game created!', data: game };
}

async function get(user: AuthUser, req: Request) {
	const id = req.query.id;
	if (typeof id !== 'string') throw new FunctionError(400, { message: 'Bad game ID' });

	const result = await db
		.select({ game: SplendorGame, player: SplendorGamePlayer })
		.from(SplendorGame)
		.innerJoin(SplendorGamePlayer, eq(SplendorGamePlayer.gameId, SplendorGame.id))
		.where(eq(SplendorGame.id, id));

	if (result.length === 0) throw new FunctionError(404, { message: 'Game not found' });

	if (!result.some(({ player }) => player?.userId === user.id))
		throw new FunctionError(403, { message: 'Forbidden' });

	const piles = mapValues(result[0].game.piles, ({ length }) => ({ length }));

	const game = {
		...result[0].game,
		piles,
		players: result.map(({ player }) => omit(player, 'gameId')),
	};

	return { message: 'Gotten!', data: game };
}
