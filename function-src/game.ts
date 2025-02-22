import { and, eq } from 'drizzle-orm';
import { SplendorGame, SplendorGamePlayer, SplendorRoom as Room, User } from '../db/schema';
import { db } from './common/db';
import { FunctionError } from './common/auth';
import type { AuthUser, GameAndPlayers } from '../common/communication';
import { newGameState } from '../common/defaults';
import { mapValues } from '../common/utils';

export async function post(user: AuthUser, id: string) {
	if (typeof id !== 'string') throw new FunctionError(400, { message: 'Bad room ID' });

	const [room, ...rest] = await db
		.select()
		.from(Room)
		.leftJoin(SplendorGamePlayer, eq(Room.id, SplendorGamePlayer.gameId))
		.where(and(eq(Room.id, id), eq(Room.ownerId, user.id), eq(Room.started, false)));

	if (room == null) throw new FunctionError(400, { message: 'Bad Request' });

	if (rest.length === 0)
		throw new FunctionError(400, { message: 'Cannot start game with only 1 player' });

	const game = newGameState(id, (rest.length + 1) as 2 | 3 | 4);

	await Promise.all([
		db.insert(SplendorGame).values(game),
		db.update(Room).set({ started: true }).where(eq(Room.id, id)),
	]);

	return game;
}

export async function get(user: AuthUser, id: string) {
	if (typeof id !== 'string') throw new FunctionError(400, { message: 'Bad game ID' });

	const result = await db
		.select({ game: SplendorGame, player: SplendorGamePlayer, userName: User.userName })
		.from(SplendorGame)
		.innerJoin(SplendorGamePlayer, eq(SplendorGamePlayer.gameId, SplendorGame.id))
		.innerJoin(User, eq(User.id, SplendorGamePlayer.userId))
		.where(eq(SplendorGame.id, id))
		.orderBy(SplendorGamePlayer.position);

	if (result.length === 0) throw new FunctionError(404, { message: 'Game not found' });

	if (!result.some(({ player }) => player?.userId === user.id))
		throw new FunctionError(403, { message: 'Forbidden' });

	const piles = mapValues(result[0].game.piles, ({ length }) => ({ length } as number[]));

	const game: GameAndPlayers = {
		...result[0].game,
		piles,
		players: result.map(({ player, userName }) => ({
			...player,
			userName,
		})),
	};

	return game;
}
