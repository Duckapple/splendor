import {
  IndexBuilder,
  MySqlColumn,
  char,
  index,
  int,
  json,
  mysqlTable,
  text,
  tinyint,
  varchar,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { never, object, string } from "valibot";
import { createInsertSchema } from "drizzle-valibot";

function indicesOn<T extends string>(
  ...keys: T[]
): (table: { [P in T]: MySqlColumn }) => { [P in T]: IndexBuilder } {
  return (table: { [P in T]: MySqlColumn }) =>
    Object.fromEntries(
      keys.map((key) => [key + "Index", index(key + "Index").on(table[key])])
    ) as { [P in T]: IndexBuilder };
}

function uuid<T extends string>(name: T) {
  return char(name, { length: 36 })
    .notNull()
    .default(sql`(UUID())`);
}

export const User = mysqlTable(
  "User",
  {
    id: uuid("id").primaryKey(),
    bcrypt: char("bcrypt", { length: 60 }).notNull(),
    userName: varchar("userName", { length: 64 }).notNull().unique(),
  },
  indicesOn("id")
);

export type User = typeof User.$inferSelect;

export const newUserSchema = createInsertSchema(User, {
  bcrypt: never(),
});

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

// prettier-ignore
export const SplendorGamePlayer = mysqlTable("SplendorGamePlayer", {
  userId: uuid("userId"),
  gameId: uuid("gameId"),
  position: tinyint("position").notNull(),
  cards: json("cards").notNull().default(sql`('[]')`),
});

// prettier-ignore
export const SplendorGame = mysqlTable("SplendorGame", {
  id: uuid("id").primaryKey(),
  shown: json("shown").default(sql`('{"high":[],"middle":[],"low":[],"persons":[]}')`),
  piles: json("piles").default(sql`('{"high":[],"middle":[],"low":[],"persons":[]}')`),
  tokens: json("tokens").default(sql`('[0,0,0,0,0,0]')`),
  turn: tinyint("turn").default(0),
});
