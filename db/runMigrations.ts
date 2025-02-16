import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';

import * as schema from './schema';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');

const connection = new Pool({ connectionString: process.env.DATABASE_URL });

const db = drizzle(connection, { logger: true, schema });

await migrate(db, { migrationsFolder: './drizzle' });

console.log('Done!');

connection.end();
