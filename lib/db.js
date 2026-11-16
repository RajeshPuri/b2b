import { Pool } from "pg";

const globalForDb = globalThis;

export const pool =
  globalForDb.__b2bPool ||
  new Pool({
    host: "127.0.0.1",
    port: 5433,
    user: "b2b_user",
    password: "devpass123",
    database: "b2b_platform",
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__b2bPool = pool;
}

export async function query(text, params) {
  return pool.query(text, params);
}
