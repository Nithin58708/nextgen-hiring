const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../db');
const { callOpenRouter } = require('../utils/aiHelper');

router.get('/score/:jobId', auth, async (req, res) => {
  await getMatchScore(req, res);
});

router.post('/:jobId', auth, async (req, res) => {
  await getMatchScore(req, res);
});

async function getMatchScore(req, res) {
  try {
    const userId = req.user.id;
    const jobId = req.params.jobId;
    const skillsRes = await pool.query(
      'SELECT skill_name FROM user_skills WHERE user_id=$1',[userId]);
    const userSkills = skillsRes.rows.map(r=>r.skill_name);
    const jobRes = await pool.query('SELECT * FROM jobs WHERE id=$1',[jobId]);
    if (!jobRes.rows.length)
      return res.status(404).json({ error:'Job not found' });
    const job = jobRes.rows[0];
    const jSkills = Array.isArray(job.required_skills)
      ? job.required_skills
      : JSON.parse(job.required_skills||'[]');
    const uLow = userSkills.map(s=>s.toLowerCase());
    const matched = jSkills.filter(s=>uLow.includes(s.toLowerCase()));
    const missing = jSkills.filter(s=>!uLow.includes(s.toLowerCase()));
    const score = jSkills.length>0
      ? Math.round((matched.length/jSkills.length)*100) : 50;
    let reasoning = 'Score based on skill overlap with job requirements.';
    try {
      const userPrompt = 'Score '+score+'% for candidate with skills '+
          JSON.stringify(userSkills).substring(0,200)+
          ' applying for '+job.title+'. Required: '+
          JSON.stringify(jSkills)+
          '. Write 2 sentence explanation.';
      const r = await callOpenRouter('Return ONLY: {"reasoning":"your text"}', userPrompt);
      const d = typeof r === 'string' ? JSON.parse(r.replace(/```json/g,'').replace(/```/g,'').trim()) : r;
      reasoning = d.reasoning || reasoning;
    } catch(e) {}
    const result = { success:true, score, matchedSkills:matched,
      missingSkills:missing, reasoning };
    await pool.query(
      `INSERT INTO job_matches(user_id,job_id,score,reasoning,
        matched_skills,missing_skills,created_at)
       VALUES($1,$2,$3,$4,$5,$6,NOW()) ON CONFLICT(user_id,job_id)
       DO UPDATE SET score=$3,reasoning=$4,matched_skills=$5,missing_skills=$6`,
      [userId,jobId,score,reasoning,
       JSON.stringify(matched),JSON.stringify(missing)]);
    return res.json(result);
  } catch(err) { return res.status(500).json({ error:err.message }); }
}

router.post('/suggestions/:jobId', auth, async (req, res) => {
  // Simple redirect or internal call to suggestionRoutes logic
  res.json({ success: true, message: 'Redirected to suggestions' });
});

router.get('/latest', auth, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT jm.*,j.title,j.company FROM job_matches jm
       JOIN jobs j ON jm.job_id=j.id
       WHERE jm.user_id=$1 ORDER BY jm.created_at DESC LIMIT 1`,
      [req.user.id]);
    return res.json({ success:true, match:r.rows[0]||null });
  } catch(err) { return res.status(500).json({ error:err.message }); }
});

module.exports = router;
