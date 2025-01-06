import {
	IndexBuilder,
	SQLiteColumn as PgColumn,
	index,
	sqliteTable as pgTable,
	// pgTable,
	text,
	integer,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { object, string } from 'valibot';
import { createInsertSchema } from 'drizzle-valibot';
import type { GamePhase, IdDecks, TokenHold } from '../common/model';
import { randomId } from '../common/utils';

function indicesOn<T extends string>(
	...keys: T[]
): (table: { [P in T]: PgColumn }) => { [P in T]: IndexBuilder } {
	return (table: { [P in T]: PgColumn }) =>
		Object.fromEntries(keys.map((key) => [key + 'Index', index(key + 'Index').on(table[key])])) as {
			[P in T]: IndexBuilder;
		};
}

const boolean = (name: string) => integer(name, { mode: 'boolean' });
const smallint = integer;
const uuid = text;
const char = text;
const varchar = text;
const timestamp = (name: string, _: unknown) => integer(name, { mode: 'timestamp_ms' });
const json = (name: string) => text(name, { mode: 'json' });
const pgEnum =
	<T extends readonly [string, ...string[]]>(_: string, enumerate: T) =>
	(name: string) =>
		text(name, { enum: enumerate });

export const User = pgTable(
	'User',
	{
		id: uuid('id').primaryKey(),
		bcrypt: char('bcrypt', { length: 60 }).notNull(),
		userName: varchar('userName', { length: 64 }).notNull().unique(),
	},
	indicesOn('id')
);

export type User = typeof User.$inferSelect;

export const Push = pgTable(
	'Push',
	{
		userId: uuid('userId').notNull(),
		keys: json('keys').notNull(),
		endpoint: text('endpoint').notNull(),
	},
	indicesOn('userId')
);

export const pushSchema = createInsertSchema(Push, {
	keys: object({
		p256dh: string(),
		auth: string(),
	}),
});

export const SplendorRoom = pgTable('SplendorRoom', {
	id: uuid('id')
		.primaryKey()
		.$defaultFn(() => randomId('sr')),
	ownerId: uuid('ownerId').notNull(),
	started: boolean('started').default(false),
	createdAt: timestamp('createdAt', { precision: 0 }).notNull().defaultNow(),
	updatedAt: timestamp('updatedAt', { precision: 0 }).notNull().defaultNow(),
});

export type SplendorRoom = typeof SplendorRoom.$inferSelect;

// prettier-ignore
export const SplendorGamePlayer = pgTable("SplendorGamePlayer", {
  userId: uuid("userId").notNull(),
  gameId: uuid("gameId").notNull(),
  position: smallint("position").notNull(),
	reserved: json("reserved").notNull().default(sql`('[]')`).$type<number[]>(),
  cards: json("cards").notNull().default(sql`('[]')`).$type<number[]>(),
  tokens: json("tokens").notNull().default(sql`('[0,0,0,0,0,0]')`).$type<TokenHold>(),
});
export type SplendorGamePlayer = typeof SplendorGamePlayer.$inferSelect;

// prettier-ignore
export const SplendorGame = pgTable("SplendorGame", {
  id: uuid("id").primaryKey(),
  shown: json("shown").default(sql`('{"high":[],"middle":[],"low":[],"persons":[]}')`).notNull().$type<IdDecks>(),
  piles: json("piles").default(sql`('{"high":[],"middle":[],"low":[],"persons":[]}')`).notNull().$type<IdDecks>(),
  tokens: json("tokens").default(sql`('[0,0,0,0,0,0]')`).notNull().$type<TokenHold>(),
  turn: smallint("turn").notNull().default(0).$type<0 | 1 | 2 | 3>(),
  playerCount: smallint("playerCount").notNull().$type<1 | 2 | 3 | 4>(),
	phase: smallint("phase").notNull().default(0).$type<GamePhase>(),
});
export type SplendorGame = typeof SplendorGame.$inferSelect;

export const SplendorGameSelect = {
	id: SplendorGame.id,
	shown: SplendorGame.shown,
	tokens: SplendorGame.tokens,
	turn: SplendorGame.turn,
	playerCount: SplendorGame.playerCount,
	phase: SplendorGame.phase,
};
export type SplendorGameSelect = typeof SplendorGameSelect;

const splendorActions = ['BUY_CARD', 'TAKE_PERSON', 'TAKE_TOKENS', 'RESERVE'] as const;
export const SplendorActionType = pgEnum('SplendorActionType', splendorActions);
export type SplendorActionType = (typeof splendorActions)[number];

export const SplendorAction = pgTable('SplendorAction', {
	gameId: uuid('gameId').notNull(),
	userId: uuid('userId').notNull(),
	timestamp: timestamp('timestamp', { precision: 0 }).notNull().defaultNow(),
	type: SplendorActionType('type').notNull(),
	data: json('data').notNull(),
});

export type SplendorAction = typeof SplendorAction.$inferSelect;
