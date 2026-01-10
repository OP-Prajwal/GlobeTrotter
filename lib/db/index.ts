import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

config({ path: '.env' });

import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;
// postgres.js sends extra params as startup params, which pgbouncer might reject.
// We clean generic params that might be there for other ORMs (like Prisma).
// Production-Ready Configuration
const client = postgres(connectionString.replace("?pgbouncer=true", ""), {
    prepare: false,      // Disable prepared statements for PGBouncer (Transaction Mode)
    ssl: 'require',      // Force SSL (Required for Supabase)
    connect_timeout: 10, // Fail fast on connection issues
    idle_timeout: 15,    // Clean up idle connections for serverless
    max: 10              // Limit pool size for serverless
});
export const db = drizzle(client, { schema });
