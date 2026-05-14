import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg"; // creates reusable DB connections
// every request opens new connection
// performance dies

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);
