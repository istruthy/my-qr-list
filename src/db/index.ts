import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

// For development, we'll use a local SQLite file
// In production, you'd use Turso cloud database
const client = createClient({
  url: 'file:./local.db', // Local SQLite file for development
  // For Turso production:
  // url: process.env.TURSO_DATABASE_URL!,
  // authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client, { schema });

// Export schema for migrations
export { schema };
