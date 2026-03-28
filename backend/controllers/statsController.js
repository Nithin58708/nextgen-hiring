const { pool } = require('../db');

exports.getFinderStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const statsRes = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM job_matches WHERE user_id = $1) as jobs_matched,
        (SELECT COUNT(*) FROM assessment_results WHERE user_id = $2) as tests_taken,
        (SELECT COUNT(*) FROM resumes WHERE user_id = $3 AND raw_text IS NOT NULL) as resume_uploaded,
        (SELECT AVG(score) FROM assessment_results WHERE user_id = $4) as avg_match_score
      `, [userId, userId, userId, userId]);

    const data = statsRes.rows[0];
    res.json({
      jobs_matched: parseInt(data.jobs_matched || 0),
      tests_taken: parseInt(data.tests_taken || 0),
      resume_uploaded: parseInt(data.resume_uploaded || 0) > 0,
      avg_match_score: data.avg_match_score ? parseFloat(parseFloat(data.avg_match_score).toFixed(2)) : 0
    });
  } catch (err) {
    console.error('Finder Stats Error:', err);
    res.status(500).json({ error: 'Failed to fetch finder stats' });
  }
};

exports.getPosterStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const statsRes = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM jobs WHERE posted_by = $1) as total_jobs,
        (SELECT COUNT(*) FROM jobs WHERE posted_by = $2 AND status = 'pending') as pending_jobs,
        (SELECT COUNT(*) FROM jobs WHERE posted_by = $3 AND status = 'approved') as approved_jobs
      `, [userId, userId, userId]);

    const data = statsRes.rows[0];
    res.json({
      total_jobs_posted: parseInt(data.total_jobs || 0),
      pending_jobs: parseInt(data.pending_jobs || 0),
      approved_jobs: parseInt(data.approved_jobs || 0)
    });
  } catch (err) {
    console.error('Poster Stats Error:', err);
    res.status(500).json({ error: 'Failed to fetch poster stats' });
  }
};
