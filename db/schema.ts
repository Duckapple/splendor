import { int, mysqlTable, text } from "drizzle-orm/mysql-core";

export const testTable = mysqlTable("test", {
  id: int("id").primaryKey(),
  firstName: text("first_name"),
});

export type Test = typeof testTable.$inferSelect;
export type NewTest = typeof testTable.$inferInsert;
