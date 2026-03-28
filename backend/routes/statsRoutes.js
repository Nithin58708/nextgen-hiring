const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../db');

router.get('/finder', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const r = await pool.query(`SELECT
      (SELECT COUNT(*)::int FROM job_matches WHERE user_id=$1) as jobs_matched,
      (SELECT COUNT(*)::int FROM assessment_results WHERE user_id=$1) as tests_taken,
      (SELECT EXISTS(SELECT 1 FROM resumes WHERE user_id=$1)) as resume_uploaded,
      (SELECT COALESCE(AVG(score)::int, 0) FROM assessment_results WHERE user_id=$1) as avg_match_score`,
      [userId]
    );
    return res.json({ success: true, ...r.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/poster', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const r = await pool.query(`SELECT
      (SELECT COUNT(*)::int FROM jobs WHERE posted_by=$1) as total_jobs_posted,
      (SELECT COUNT(*)::int FROM jobs WHERE posted_by=$1 AND status='pending') as pending_jobs,
      (SELECT COUNT(*)::int FROM jobs WHERE posted_by=$1 AND status='approved') as approved_jobs`,
      [userId]
    );
    return res.json({ success: true, ...r.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
