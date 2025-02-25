import { t } from 'elysia';
import type { AuthUser } from '../common/communication';
import type { Infer } from './common/type';
import { RedirectError } from './common/error';
import { db } from './common/db';
import { SplendorGamePlayer, SplendorRoom } from '../db/schema';
import { getGame } from './room';
import { eq } from 'drizzle-orm';

get.params = { query: t.Object({ id: t.String() }) };
export async function get(user: AuthUser, { query: { id } }: Infer<typeof get.params>) {
	const roomAndPlayers = await getGame(eq(SplendorRoom.id, id));

	const [data] = roomAndPlayers;

	if (!data) {
		throw new RedirectError(303, `/new?id=${id}`);
	}

	const players = data.players;

	if (players.length < 4 && players.every((player) => player.userId !== user.id)) {
		const length = players.length as 0 | 1 | 2 | 3;

		const newPlayer = {
			gameId: id,
			userId: user.id,
			position: length,
			cards: [],
		};

		await db.insert(SplendorGamePlayer).values(newPlayer);
	}

	throw new RedirectError(303, `/new?id=${id}`);
}
