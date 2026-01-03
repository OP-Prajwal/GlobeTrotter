import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

config({ path: '.env' });

import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;
// postgres.js sends extra params as startup params, which pgbouncer might reject.
// We clean generic params that might be there for other ORMs (like Prisma).
const client = postgres(connectionString.replace("?pgbouncer=true", "").replace("&pgbouncer=true", ""), { prepare: false });
export const db = drizzle(client, { schema });
