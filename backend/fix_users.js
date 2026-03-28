require('dotenv').config();
const { pool } = require('./db');
const bcrypt = require('bcryptjs');

async function fix() {
  console.log('DB URL:', process.env.DATABASE_URL?.substring(0,20) + '...');
  try {
    const hash = await bcrypt.hash('admin', 10);
    const users = [
      { u: 'Karthi', e: 'karthi@gmail.com', r: 'job_finder' },
      { u: 'Mani', e: 'mani@gmail.com', r: 'job_poster' },
      { u: 'Nithin', e: 'nithin@gmail.com', r: 'admin' }
    ];

    for (const user of users) {
      console.log('Cleaning up:', user.u);
      const sub = '(SELECT id FROM users WHERE username=$1 OR email=$2)';
      await pool.query('DELETE FROM job_applications WHERE user_id IN ' + sub, [user.u, user.e]);
      await pool.query('DELETE FROM assessment_results WHERE user_id IN ' + sub, [user.u, user.e]);
      await pool.query('DELETE FROM suggestions WHERE user_id IN ' + sub, [user.u, user.e]);
      await pool.query('DELETE FROM job_matches WHERE user_id IN ' + sub, [user.u, user.e]);
      await pool.query('DELETE FROM resumes WHERE user_id IN ' + sub, [user.u, user.e]);
      await pool.query('DELETE FROM user_skills WHERE user_id IN ' + sub, [user.u, user.e]);
      await pool.query('DELETE FROM job_finder_profiles WHERE user_id IN ' + sub, [user.u, user.e]);
      await pool.query('DELETE FROM users WHERE username=$1 OR email=$2', [user.u, user.e]);
      
      // Insert
      const res = await pool.query(
        'INSERT INTO users (username, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id',
        [user.u, user.e, hash, user.r]
      );
      
      if (user.r === 'job_finder') {
        await pool.query('INSERT INTO job_finder_profiles (user_id) VALUES ($1)', [res.rows[0].id]);
      }
      console.log('Fixed:', user.u);
    }
    console.log('User setup complete');
  } catch(e) {
    console.error('FIX ERROR:', e.message);
  } finally {
    process.exit(0);
  }
}
fix();
