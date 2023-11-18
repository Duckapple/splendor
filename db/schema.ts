import {
  IndexBuilder,
  MySqlColumn,
  boolean,
  char,
  datetime,
  index,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  tinyint,
  varchar,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { object, string } from "valibot";
import { createInsertSchema } from "drizzle-valibot";
import type { Color, IdDecks } from "../common/model";

function indicesOn<T extends string>(
  ...keys: T[]
): (table: { [P in T]: MySqlColumn }) => { [P in T]: IndexBuilder } {
  return (table: { [P in T]: MySqlColumn }) =>
    Object.fromEntries(
      keys.map((key) => [key + "Index", index(key + "Index").on(table[key])])
    ) as { [P in T]: IndexBuilder };
}

function uuid<T extends string>(name: T) {
  return char(name, { length: 36 }).notNull();
}
function uuidDefaulted<T extends string>(name: T) {
  return uuid(name).default(sql`(UUID())`);
}

export const User = mysqlTable(
  "User",
  {
    id: uuidDefaulted("id").primaryKey(),
    bcrypt: char("bcrypt", { length: 60 }).notNull(),
    userName: varchar("userName", { length: 64 }).notNull().unique(),
  },
  indicesOn("id")
);

export type User = typeof User.$inferSelect;

export const Push = mysqlTable(
  "Push",
  {
    userId: uuid("userId"),
    keys: json("keys").notNull(),
    endpoint: text("endpoint").notNull(),
  },
  indicesOn("userId")
);

export const pushSchema = createInsertSchema(Push, {
  keys: object({
    p256dh: string(),
    auth: string(),
  }),
});

export const SplendorRoom = mysqlTable("SplendorRoom", {
  id: uuidDefaulted("id").primaryKey(),
  ownerId: uuid("ownerId"),
  started: boolean("started").default(false),
  createdAt: datetime("createdAt", { fsp: 0 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type SplendorRoom = typeof SplendorRoom.$inferSelect;

// prettier-ignore
export const SplendorGamePlayer = mysqlTable("SplendorGamePlayer", {
  userId: uuid("userId"),
  gameId: uuid("gameId"),
  position: tinyint("position").notNull(),
  cards: json("cards").notNull().default(sql`('[]')`).$type<number[]>(),
  tokens: json("tokens").notNull().default(sql`('[0,0,0,0,0,0]')`).$type<Record<Color, number>>(),
});
export type SplendorGamePlayer = typeof SplendorGamePlayer.$inferSelect;

// prettier-ignore
export const SplendorGame = mysqlTable("SplendorGame", {
  id: uuid("id").primaryKey(),
  shown: json("shown").default(sql`('{"high":[],"middle":[],"low":[],"persons":[]}')`).$type<IdDecks>(),
  piles: json("piles").default(sql`('{"high":[],"middle":[],"low":[],"persons":[]}')`).$type<IdDecks>(),
  tokens: json("tokens").default(sql`('[0,0,0,0,0,0]')`).$type<Record<Color, number>>(),
  turn: tinyint("turn").default(0),
});
export type SplendorGame = typeof SplendorGame.$inferSelect;

export const SplendorGameSelect = {
  id: SplendorGame.id,
  shown: SplendorGame.shown,
  tokens: SplendorGame.tokens,
  turn: SplendorGame.turn,
};
export type SplendorGameSelect = typeof SplendorGameSelect;

const splendorActions = [
  "BUY_CARD",
  "TAKE_PERSON",
  "TAKE_TOKENS",
  "RESERVE",
] as const;
export const SplendorActionType = mysqlEnum(
  "SplendorActionType",
  splendorActions
);
export type SplendorActionType = (typeof splendorActions)[number];

export const SplendorAction = mysqlTable("SplendorAction", {
  gameId: uuid("gameId"),
  userId: uuid("userId"),
  timestamp: datetime("timestamp", { fsp: 0 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  type: SplendorActionType.notNull(),
  data: json("data").notNull(),
});
