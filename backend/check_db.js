const { pool } = require('./db');

async function check() {
  try {
    const res = await pool.query("SELECT id, job_role, questions FROM assessments ORDER BY id DESC LIMIT 3");
    console.log('--- LATEST ASSESSMENTS ---');
    res.rows.forEach(r => {
      console.log(`ID: ${r.id}, Role: ${r.job_role}`);
      const qs = typeof r.questions === 'string' ? JSON.parse(r.questions) : r.questions;
      console.log('Q1:', qs[0]?.question);
      console.log('Q2:', qs[1]?.question);
      console.log('Q20:', qs[19]?.question);
      console.log('Types:', qs.map(q => q.type).slice(0, 5).join(', '));
      console.log('---------------------------');
    });

    const matchRes = await pool.query("SELECT id, finder_id, job_id, match_score FROM job_matches ORDER BY matched_at DESC LIMIT 3");
    console.log('--- LATEST MATCHES ---');
    matchRes.rows.forEach(m => {
      console.log(`ID: ${m.id}, Finder: ${m.finder_id}, Job: ${m.job_id}, Score: ${m.match_score}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
