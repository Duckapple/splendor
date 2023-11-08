import {
  IndexBuilder,
  MySqlColumn,
  char,
  index,
  json,
  mysqlTable,
  text,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

function indexOn<T extends string>(
  ...keys: T[]
): (table: { [P in T]: MySqlColumn }) => { [P in T]: IndexBuilder } {
  return (table: { [P in T]: MySqlColumn }) =>
    Object.fromEntries(
      keys.map((key) => [key + "Index", index(key + "Index").on(table[key])])
    ) as { [P in T]: IndexBuilder };
}

function uuid(name: string) {
  return char(name, { length: 36 })
    .notNull()
    .default(sql`UUID()`);
}

export const User = mysqlTable(
  "User",
  {
    id: uuid("id").primaryKey(),
    userName: text("userName").notNull(),
    bcrypt: char("bcrypt", { length: 60 }).notNull(),
  },
  indexOn("userName")
);

export type User = typeof User.$inferSelect;
export type NewUser = typeof User.$inferInsert;

export const Push = mysqlTable("Push", {
  userId: uuid("userId").references(() => User.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  keys: json("keys"),
  endpoint: text("endpoint"),
});
