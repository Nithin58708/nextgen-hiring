const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function check() {
  const res = await pool.query('SELECT * FROM users');
  console.log('Users in DB:');
  console.table(res.rows);
  const profiles = await pool.query('SELECT * FROM job_finder_profiles');
  console.log('Finder Profiles:');
  console.table(profiles.rows);
  await pool.end();
}

check();
