require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function fixUsers() {
  const users = [
    { username: 'Karthi', email: 'karthi@nextgen.com', password: 'admin', role: 'job_finder' },
    { username: 'Mani', email: 'mani@nextgen.com', password: 'admin', role: 'job_poster' },
    { username: 'Nithin', email: 'nithin58708@gmail.com', password: 'admin', role: 'admin' }
  ];

  console.log('--- Starting User Fix ---');

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    
    // Check if user exists by username
    const exists = await pool.query(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1)',
      [u.username]
    );

    if (exists.rows.length > 0) {
      // Update existing user
      await pool.query(
        'UPDATE users SET password = $1, role = $2, email = $3 WHERE LOWER(username) = LOWER($4)',
        [hash, u.role, u.email, u.username]
      );
      console.log(`[UPDATED] user: ${u.username} (role: ${u.role}, email: ${u.email})`);
    } else {
      // Insert new user
      const result = await pool.query(
        'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [u.username, u.email, hash, u.role]
      );
      console.log(`[CREATED] user: ${u.username} (id: ${result.rows[0].id}, role: ${u.role})`);
    }
  }

  // Display summary
  const allUsers = await pool.query('SELECT id, username, email, role FROM users ORDER BY id');
  console.log('--- Current Database Users ---');
  console.table(allUsers.rows);

  console.log('--- User Fix Complete ---');
  await pool.end();
}

fixUsers().catch(err => {
  console.error('[ERROR] Fix failed:', err.message);
  pool.end();
  process.exit(1);
});
