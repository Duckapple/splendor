import { drizzle as bunDrizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';

const database = new Database(process.env.DATABASE_FILE, { strict: true, create: true });

export const db = bunDrizzle(database);
