import { drizzle } from "drizzle-orm/planetscale-serverless";
import { migrate } from "drizzle-orm/planetscale-serverless/migrator";
import { connect } from "@planetscale/database";
import { env } from "./env";

const connection = connect({
  host: env.DATABASE_HOST,
  username: env.DATABASE_USERNAME,
  password: env.DATABASE_PASSWORD,
});

const db = drizzle(connection, { logger: true });

await migrate(db, { migrationsFolder: "./drizzle" });

console.log("Done!");
