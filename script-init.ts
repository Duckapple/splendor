import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

import { env } from './db/env';

const connection = neon(env.DATABASE_URL);

export const db = drizzle(connection, { logger: true });
