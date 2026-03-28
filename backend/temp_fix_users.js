require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function fixUsers() {
  const users = [
    {username:'Karthi', email:'karthi@nextgen.com', 
     password:'admin', role:'job_finder'},
    {username:'Mani', email:'mani@nextgen.com', 
     password:'admin', role:'job_poster'},
    {username:'Nithin', email:'nithin58708@gmail.com', 
     password:'admin', role:'admin'}
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    
    // Use lower() for case-insensitive matching
    const exists = await pool.query(
      'SELECT id FROM users WHERE LOWER(username)=LOWER($1)',
      [u.username]
    );

    if (exists.rows.length > 0) {
      await pool.query(
        'UPDATE users SET password=$1, role=$2 WHERE LOWER(username)=LOWER($3)',
        [hash, u.role, u.username]
      );
      console.log('Updated:', u.username, '- password reset to admin');
    } else {
      const r = await pool.query(
        `INSERT INTO users (username,email,password,role) 
         VALUES ($1,$2,$3,$4) RETURNING id`,
        [u.username, u.email, hash, u.role]
      );
      console.log('Created:', u.username, 'id:', r.rows[0].id);
    }
  }

  const allUsers = await pool.query(
    'SELECT id,username,email,role FROM users'
  );
  console.log('All users now:', JSON.stringify(allUsers.rows, null, 2));
  pool.end();
}

fixUsers().catch(e => {
  console.error('Error:', e.message); 
  pool.end();
});
