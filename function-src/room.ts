import { and, eq, SQL } from 'drizzle-orm';
import { SplendorGamePlayer, SplendorRoom, User } from '../db/schema';
import { db } from './common/db';
import { FunctionError } from './common/httpGuarded';
import { randomUUID } from 'crypto';
import { AuthUser } from '../common/communication';
import { alias } from 'drizzle-orm/pg-core';
import { t } from 'elysia';

const playerAgain = alias(SplendorGamePlayer, 'player2');

export async function post(user: AuthUser) {
	const id = randomUUID();
	const room = { id, ownerId: user.id, started: false, createdAt: new Date() };
	const inserts = [
		db.insert(SplendorRoom).values(room),
		db.insert(SplendorGamePlayer).values({ gameId: id, userId: user.id, position: 0 }),
	];
	const players = [{ userId: user.id, position: 0, userName: user.userName }];
	await Promise.all(inserts);
	return { message: 'Room created!', data: { ...room, players } };
}

put.params = { query: t.Object({ id: t.String() }) };
export async function put(user: AuthUser, query: { id: string }) {
	const { id } = query;

	const roomAndPlayers = await getGame(eq(SplendorRoom.id, id));

	if (roomAndPlayers == null || roomAndPlayers.length === 0) {
		throw new FunctionError(404, { message: 'Not Found' });
	}

	const [data] = roomAndPlayers;

	const players = data.players;

	let message = "You're already in the room!";

	if (players.length < 4 && players.every((player) => player.userId !== user.id)) {
		const newPlayer = {
			gameId: id,
			userId: user.id,
			position: players.length,
			cards: [],
		};
		await db.insert(SplendorGamePlayer).values(newPlayer);
		players.push({
			userId: user.id,
			position: players.length,
			userName: user.userName,
		});
		message = 'Joined the room!';
	}

	return { message, data };
}

get.params = { query: t.Object({ id: t.Optional(t.String()) }) };
export async function get(user: AuthUser, query: { id?: string }) {
	const id = query.id;

	if (!id) {
		let manyResult = await getGame(eq(playerAgain.userId, user.id));
		return { message: 'Found rooms for user', data: manyResult };
	}

	const [data] = await getGame(
		and(eq(SplendorRoom.id, id), eq(playerAgain.userId, user.id)) as SQL
	);

	if (data == null) {
		throw new FunctionError(404, { message: 'Not Found' });
	}

	if (data.players.every((player) => player.userId !== user.id)) {
		throw new FunctionError(404, { message: 'Not part of room', data: 'NOT_IN_ROOM' as const });
	}

	return { message: 'Found room', data };
}

export async function getGame(where: ReturnType<typeof eq>) {
	const roomAndPlayers = await db
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
		.leftJoin(User, eq(User.id, SplendorGamePlayer.userId))
		.leftJoin(playerAgain, eq(playerAgain.gameId, SplendorRoom.id))
		.where(where);

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
