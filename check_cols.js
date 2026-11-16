const { Pool } = require('pg');

const pool = new Pool({
  host: '127.0.0.1',
  port: 5433,
  user: 'b2b_user',
  password: 'devpass123',
  database: 'b2b_platform',
});

pool.query(
  "SELECT column_name FROM information_schema.columns WHERE table_name = 'User'",
  function(err, res) {
    console.log('User columns:');
    res.rows.forEach(function(r) { console.log(' -', r.column_name); });
    pool.end();
  }
);