const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
});

pool.connect().then(client => {
  const sql = fs.readFileSync('./setup-database.sql', 'utf8');
  
  // Execute the SQL - use a simpler approach: just run the whole thing
  // and handle errors
  client.query(sql, (err, res) => {
    if (err) {
      console.error('SQL Error:', err.message);
      console.error('Error code:', err.code);
    } else {
      console.log('✅ Database setup completed');
      // List tables
      client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name", (err2, res2) => {
        console.log('Tables created:', res2.rows.length);
        res2.rows.forEach(r => console.log(' -', r.table_name));
        client.release();
        pool.end();
        process.exit(0);
      });
    }
  });
}).catch(err => {
  console.error('Pool connection error:', err);
  process.exit(1);
});