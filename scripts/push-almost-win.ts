import { eq } from 'drizzle-orm';
import winSnapshotTest from '$common/test/win.snapshot.test';
import { SplendorGame, SplendorGamePlayer, SplendorRoom } from '../db/schema';
import { db } from './local-db';
import { $ } from 'bun';

await Promise.all([
	db.delete(SplendorRoom).where(eq(SplendorRoom.id, winSnapshotTest.game.id)),
	db.delete(SplendorGame).where(eq(SplendorGame.id, winSnapshotTest.game.id)),
	db.delete(SplendorGamePlayer).where(eq(SplendorGamePlayer.gameId, winSnapshotTest.game.id)),
]);

await Promise.all([
	db
		.insert(SplendorRoom)
		.values({ id: winSnapshotTest.game.id, ownerId: winSnapshotTest.players[0].userId }),
	db.insert(SplendorGame).values(winSnapshotTest.game),
	db.insert(SplendorGamePlayer).values(winSnapshotTest.players),
]);

await $`xdg-open 'http://localhost:5173/game?id=${winSnapshotTest.game.id}'`;
