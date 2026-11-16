import { Pool } from "pg";

const globalForDb = globalThis;

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    const isLocal =
      connectionString.includes("localhost") ||
      connectionString.includes("127.0.0.1");

    return new Pool({
      connectionString,
      ssl: isLocal ? undefined : { rejectUnauthorized: false },
      max: 10,
    });
  }

  return new Pool({
    host: "127.0.0.1",
    port: 5433,
    user: "b2b_user",
    password: "devpass123",
    database: "b2b_platform",
    max: 10,
  });
}

export const pool = globalForDb.__b2bPool || createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__b2bPool = pool;
}

export async function query(text, params) {
  return pool.query(text, params);
}
