const { Pool } = require('pg');

const pool = new Pool({
  host: '127.0.0.1',
  port: 5433,
  user: 'b2b_user',
  password: 'devpass123',
  database: 'b2b_platform',
});

const queries = [
  'SELECT COUNT(*) as userCount FROM "User"',
  'SELECT COUNT(*) as businessCount FROM "Business"',
  'SELECT COUNT(*) as orderCount FROM "Order"',
  'SELECT COUNT(*) as invoiceCount FROM "Invoice"'
];

let completed = 0;

function checkResults(err, res) {
  if (err) {
    console.error('Query error:', err.message);
    completed++;
    if (completed === queries.length) {
      pool.end();
      process.exit(0);
    }
    return;
  }
  console.log('Count:', res.rows[0].count);
  completed++;
  if (completed === queries.length) {
    pool.end();
    process.exit(0);
  }
}

queries.forEach((q, i) => {
  pool.query(q, checkResults);
});