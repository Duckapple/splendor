import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';

import { env } from './env';
import * as schema from './schema';

const connection = new Pool({ connectionString: env.DATABASE_URL });

const db = drizzle(connection, { logger: true, schema });

await migrate(db, { migrationsFolder: './drizzle' });

console.log('Done!');

connection.end();
