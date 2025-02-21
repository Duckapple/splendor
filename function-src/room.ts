import { eq, SQL } from 'drizzle-orm';
import { SplendorGamePlayer, SplendorRoom, User } from '../db/schema';
import { db } from './common/db';
import { Auth } from './common/auth';
import { randomUUID } from 'crypto';
import { alias } from 'drizzle-orm/pg-core';
import { Elysia } from 'elysia';

const playerAgain = alias(SplendorGamePlayer, 'player2');

export const room = new Elysia({ prefix: '/room' })
	.use(Auth)
	.guard({ auth: true })
	.get('/', async ({ user }) => {
		return await getGame(eq(playerAgain.userId, user.id), true);
	})
	.get('/:id', async ({ user, params: { id }, error }) => {
		const [data] = await getGame(eq(SplendorRoom.id, id) as SQL);

		if (data == null) {
			return error(404, { message: 'Not Found' });
		}

		if (data.players.every((player) => player.userId !== user.id)) {
			return error(404, { message: 'Not part of room', data: 'NOT_IN_ROOM' as const });
		}

		return data;
	})
	.post('/', async ({ user }) => {
		const id = randomUUID();
		const room = { id, ownerId: user.id, started: false, createdAt: new Date() };
		const inserts = [
			db.insert(SplendorRoom).values(room),
			db.insert(SplendorGamePlayer).values({ gameId: id, userId: user.id, position: 0 }),
		];
		const players = [{ userId: user.id, position: 0, userName: user.userName }];
		await Promise.all(inserts);
		return { ...room, players };
	})
	.put('/:id', async ({ user, params: { id }, error }) => {
		const roomAndPlayers = await getGame(eq(SplendorRoom.id, id));

		if (roomAndPlayers == null || roomAndPlayers.length === 0) {
			return error(404, { message: 'Not Found' });
		}

		const [data] = roomAndPlayers;

		const players = data.players;

		let message = "You're already in the room!";

		if (players.length < 4 && players.every((player) => player.userId !== user.id)) {
			const length = players.length as 0 | 1 | 2 | 3;
			const newPlayer = {
				gameId: id,
				userId: user.id,
				position: length,
				cards: [],
			};
			await db.insert(SplendorGamePlayer).values(newPlayer);
			players.push({
				userId: user.id,
				position: length,
				userName: user.userName,
			});
			message = 'Joined the room!';
		}

		return { message, ...data };
	});

export async function getGame(where: ReturnType<typeof eq>, inRoom?: true) {
	const partial = db
		.select({
			room: SplendorRoom,
			player: {
				userId: SplendorGamePlayer.userId,
				position: SplendorGamePlayer.position,
				userName: User.userName,
			},
		})
		.from(SplendorRoom)
		.leftJoin(SplendorGamePlayer, eq(SplendorGamePlayer.gameId, SplendorRoom.id))
		.leftJoin(User, eq(User.id, SplendorGamePlayer.userId));

	const roomAndPlayers = await (inRoom
		? partial.leftJoin(playerAgain, eq(playerAgain.gameId, SplendorRoom.id))
		: partial
	).where(where);

	if (roomAndPlayers.length === 0) return [];

	const res = new Map<
		string,
		SplendorRoom & { players: (typeof roomAndPlayers)[number]['player'][] }
	>();

	for (const { room, player } of roomAndPlayers) {
		if (!res.has(room.id)) {
			res.set(room.id, { ...room, players: [] });
		}
		res.get(room.id)?.players.push(player);
	}

	return [...res.values()];
}
