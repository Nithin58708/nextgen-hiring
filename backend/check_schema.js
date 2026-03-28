require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function checkSchema() {
  const tables = ['users', 'resumes', 'user_skills', 'job_finder_profiles', 'jobs', 'job_applications', 'job_matches', 'assessments', 'assessment_results', 'suggestions'];
  
  console.log('--- Database Schema Check ---');
  
  for (const t of tables) {
    try {
      const r = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [t]);
      
      if (r.rows.length === 0) {
        console.log(`\n[MISSING] Table: ${t}`);
      } else {
        console.log(`\nTable: ${t}`);
        console.table(r.rows);
      }
    } catch (err) {
      console.error(`[ERROR] Table: ${t} -> ${err.message}`);
    }
  }
  
  await pool.end();
}

checkSchema().catch(err => {
  console.error('[FATAL] Check failed:', err.message);
  pool.end();
});
