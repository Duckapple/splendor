// import { Pool } from '@neondatabase/serverless';
// import { drizzle } from 'drizzle-orm/neon-serverless';
// import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';

import { env } from './env';
import * as schema from './schema';
import Database from 'bun:sqlite';

// const connection = new Pool({ connectionString: env.DATABASE_URL });
const connection = new Database(env.DATABASE_FILE, { create: true, strict: true });

const db = drizzle(connection, { logger: true, schema });

await migrate(db, { migrationsFolder: './drizzle' });

console.log('Done!');

connection.close();
