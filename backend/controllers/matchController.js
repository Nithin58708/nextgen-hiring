const { pool } = require('../db');
const { callOpenRouter } = require('../utils/aiHelper');

exports.getMatchScore = async (req, res) => {
  const userId = req.user.id;
  const jobId = req.params.jobId;

  try {
    // Get user skills
    const skillsResult = await pool.query(
      'SELECT skill_name FROM user_skills WHERE user_id=$1', [userId]
    );
    const userSkills = skillsResult.rows.map(r => r.skill_name);

    // Get job
    const jobResult = await pool.query(
      'SELECT * FROM jobs WHERE id=$1', [jobId]
    );
    if (jobResult.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
    const job = jobResult.rows[0];
    const jobSkills = typeof job.required_skills === 'string' 
      ? JSON.parse(job.required_skills || '[]')
      : (job.required_skills || []);

    // Call AI for semantic reasoning
    const prompt = `
Candidate skills: ${JSON.stringify(userSkills)}
Job title: ${job.title}
Job description: ${job.description}
Required skills: ${JSON.stringify(jobSkills)}

Analyze and return ONLY valid JSON:
{
  "score": <0-100 integer>,
  "matchedSkills": [skills candidate has that match job],
  "missingSkills": [skills candidate needs but doesn't have],
  "reasoning": "2-3 sentence explanation of the score",
  "recommendation": "Should Apply / Consider Applying / Needs Preparation"
}
Return ONLY the JSON. No markdown.`;

    const aiData = await callOpenRouter("You are an AI recruitment analyst.", prompt);

    // Save to DB
    await pool.query(
      `INSERT INTO job_matches (user_id, job_id, score, reasoning, matched_skills, missing_skills)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (user_id, job_id) DO UPDATE SET
       score=$3, reasoning=$4, matched_skills=$5, missing_skills=$6`,
      [userId, jobId, aiData.score, aiData.reasoning,
       JSON.stringify(aiData.matchedSkills),
       JSON.stringify(aiData.missingSkills)]
    );

    return res.json({ success: true, id: jobId, ...aiData });
  } catch (error) {
    console.error('getMatchScore error:', error);
    res.status(500).json({ error: 'AI analysis failed' });
  }
};

exports.getSuggestions = async (req, res) => {
  const userId = req.user.id;
  const jobId = req.params.jobId;

  try {
    const { pool } = require('../db');
    const { callOpenRouter } = require('../utils/aiHelper');
    
    // Get user skills
    const skillsResult = await pool.query(
      'SELECT skill_name FROM user_skills WHERE user_id=$1', [userId]
    );
    const userSkills = skillsResult.rows.map(r => r.skill_name);

    // Get job
    const jobResult = await pool.query(
      'SELECT * FROM jobs WHERE id=$1', [jobId]
    );
    if (jobResult.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
    const job = jobResult.rows[0];

    const prompt = `Skills: ${JSON.stringify(userSkills)}
Target: ${job.title}
Return ONLY valid JSON:
{"currentMatchPercent":45,"targetMatchPercent":85,
"skillsAlreadyHave":["React"],"skillsToAdd":["Docker","AWS"],
"learningResources":[{"skill":"Docker","course":"Docker for Beginners",
"platform":"Udemy","link":"https://udemy.com","durationWeeks":2}],
"resumeTips":["Add GitHub link","Quantify achievements"],
"weeklyPlan":[{"week":1,"focus":"Docker basics",
"tasks":["Install Docker","Run first container"]}],
"interviewTopics":["System design","OOP"],
"estimatedReadyDate":"6-8 weeks"}`;

    const roadmap = await callOpenRouter("Career advisor for Indian IT student.", prompt);

    // Save to DB
    await pool.query('DELETE FROM suggestions WHERE user_id=$1 AND job_id=$2', [userId, jobId]);
    await pool.query(
      'INSERT INTO suggestions (user_id, job_id, roadmap) VALUES ($1,$2,$3)',
      [userId, jobId, JSON.stringify(roadmap)]
    );

    return res.json({ success: true, roadmap });
  } catch (error) {
    console.error('getSuggestions error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
