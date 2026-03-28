require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function fixDb() {
  try {
    console.log('Verifying and fixing database schema...');
    
    // Check if column 'username' exists in 'users'
    const colCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'username'
    `);
    
    if (colCheck.rows.length === 0) {
      console.log('Column "username" missing. Dropping and recreacting users table...');
      await pool.query('DROP TABLE IF EXISTS users CASCADE');
    }

    // Re-run initialization logic for users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(200) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Ensure job_finder_profiles exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS job_finder_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) UNIQUE,
        primary_job_role VARCHAR(200),
        primary_language VARCHAR(100) DEFAULT 'JavaScript',
        extracted_skills JSONB DEFAULT '[]',
        experience_level VARCHAR(50) DEFAULT 'fresher',
        weak_areas JSONB DEFAULT '[]',
        last_test_date TIMESTAMP
      );
    `);

    const users = [
      { username: 'Karthi', email: 'karthi@nextgen.com', password: 'admin', role: 'job_finder' },
      { username: 'Mani', email: 'mani@nextgen.com', password: 'admin', role: 'job_poster' },
      { username: 'Nithin', email: 'nithin58708@gmail.com', password: 'admin', role: 'admin' }
    ];

    for (const u of users) {
      const exists = await pool.query(
        'SELECT id FROM users WHERE LOWER(username) = LOWER($1)',
        [u.username]
      );
      
      if (exists.rows.length === 0) {
        const hash = await bcrypt.hash(u.password, 10);
        const result = await pool.query(
          'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
          [u.username, u.email, hash, u.role]
        );
        console.log('Created:', u.username, 'id:', result.rows[0].id);
        
        if (u.role === 'job_finder') {
          await pool.query(
            'INSERT INTO job_finder_profiles (user_id) VALUES ($1) ON CONFLICT DO NOTHING',
            [result.rows[0].id]
          );
        }
      } else {
        console.log('Already exists:', u.username);
      }
    }

    console.log('Database fix complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixDb();
