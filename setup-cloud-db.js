'use strict';

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is required. Example:');
  console.error('  DATABASE_URL="postgres://..." node setup-cloud-db.js');
  process.exit(1);
}

const isLocal =
  connectionString.includes('localhost') ||
  connectionString.includes('127.0.0.1');

const client = new Client({
  connectionString,
  ssl: isLocal ? undefined : { rejectUnauthorized: false },
});

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');

  await client.connect();
  console.log('Connected to database');

  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');

  const tables = await client.query(
    "SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = 'public'"
  );
  const enums = await client.query(
    "SELECT COUNT(*) AS count FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typtype = 'e' AND n.nspname = 'public'"
  );

  console.log(`Schema created: ${tables.rows[0].count} tables, ${enums.rows[0].count} enum types`);
}

main()
  .catch(async (err) => {
    console.error('Schema setup failed:', err.message);
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      // ignore rollback errors
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end().catch(() => {});
  });
