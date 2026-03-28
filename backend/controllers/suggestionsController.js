const { pool } = require('../db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

exports.getRoadmap = async (req, res) => {
  const userId = req.user.id;
  const jobId = req.query.jobId;

  try {
    // Get user skills from DB
    const skillsResult = await pool.query(
      'SELECT skill_name, skill_type FROM user_skills WHERE user_id=$1', [userId]
    );
    const userSkills = skillsResult.rows.map(r => r.skill_name);

    // Get weak areas from last test
    const profileResult = await pool.query(
      'SELECT * FROM job_finder_profiles WHERE user_id=$1', [userId]
    );
    const weakAreas = profileResult.rows[0]?.weak_areas || [];

    // Get job description
    let jobRole = 'Software Engineer';
    let jobDescription = 'General software development role';
    if (jobId) {
      const job = await pool.query('SELECT * FROM jobs WHERE id=$1', [jobId]);
      if (job.rows.length > 0) {
        jobRole = job.rows[0].title;
        jobDescription = job.rows[0].description;
      }
    } else {
      jobRole = profileResult.rows[0]?.primary_job_role || 'Software Engineer';
    }

    // Gemini prompt
    const prompt = `
You are a career advisor for an Indian IT fresher student.
Student's current skills: ${JSON.stringify(userSkills)}
Target job role: ${jobRole}
Job description: ${jobDescription}
${weakAreas.length > 0 ? `Weak areas from recent test: ${JSON.stringify(weakAreas)}` : ''}

Create a personalized learning roadmap.
Return ONLY valid JSON — no markdown, no backticks:
{
  "currentMatchPercent": <0-100>,
  "targetMatchPercent": <85-95>,
  "skillsAlreadyHave": [skills student has matching the job],
  "skillsToAdd": [skills student needs to learn],
  "learningResources": [
    {
      "skill": "skill name",
      "course": "specific course name",
      "platform": "Coursera/Udemy/YouTube/freeCodeCamp",
      "link": "real URL to the course",
      "durationWeeks": 2
    }
  ],
  "resumeTips": [4-5 specific tips as strings],
  "weeklyPlan": [
    {
      "week": 1,
      "focus": "main topic this week",
      "tasks": ["task 1", "task 2", "task 3", "task 4"]
    }
  ],
  "interviewTopics": [topics to prepare for interview],
  "estimatedReadyDate": "e.g. 6-8 weeks"
}
Return ONLY the JSON.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const roadmap = JSON.parse(cleanJson);

    // Save to DB (delete old, insert new)
    await pool.query('DELETE FROM suggestions WHERE user_id=$1', [userId]);
    await pool.query(
      'INSERT INTO suggestions (user_id, job_id, roadmap) VALUES ($1,$2,$3)',
      [userId, jobId || null, JSON.stringify(roadmap)]
    );

    return res.json({ 
      ...roadmap, 
      target_role: jobRole,
      jobRole // for backwards compatibility
    });
  } catch (error) {
    console.error('getRoadmap error:', error);
    res.status(500).json({ error: 'Failed to generate roadmap' });
  }
};
