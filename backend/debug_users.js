require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    const c = await pool.query(
      "SELECT conname, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE conrelid = 'users'::regclass"
    );
    console.log('CONSTRAINTS:');
    c.rows.forEach(r => console.log('  ' + r.conname + ': ' + r.def));

    const u = await pool.query('SELECT id,username,email FROM users ORDER BY id');
    console.log('USERS:');
    u.rows.forEach(r => console.log('  ' + r.id + ' | ' + r.username + ' | ' + r.email));

    // Test what the E2E does: PUT /admin/users/:karthiId with name, email, role
    const karthi = u.rows.find(r => r.username.includes('Karthi'));
    console.log('Karthi row:', karthi);
    
    // Is there a user with email karthi@gmail.com that is NOT karthi?
    const emailConflict = u.rows.filter(r => r.email === 'karthi@gmail.com' && r.id !== karthi?.id);
    console.log('Email conflicts:', emailConflict);
  } catch (e) {
    console.error(e.message);
  }
  process.exit(0);
})();
