const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

router.get('/roadmap', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.query.jobId || null;
    const skillsRes = await pool.query(
      'SELECT skill_name FROM user_skills WHERE user_id=$1', [userId]);
    const userSkills = skillsRes.rows.map(r => r.skill_name);
    const profileRes = await pool.query(
      'SELECT * FROM job_finder_profiles WHERE user_id=$1', [userId]);
    const profile = profileRes.rows[0] || {};
    const weakAreas = profile.weak_areas || [];
    let jobRole = profile.primary_job_role || 'Software Engineer';
    let jobDesc = 'Software development role for fresher';
    if (jobId) {
      const job = await pool.query('SELECT * FROM jobs WHERE id=$1', [jobId]);
      if (job.rows.length) {
        jobRole = job.rows[0].title;
        jobDesc = job.rows[0].description || jobDesc;
      }
    }

    const prompt = `Career advisor for Indian IT fresher student.
Current skills: ${JSON.stringify(userSkills)}
Target job role: ${jobRole}
Job description: ${jobDesc.substring(0, 300)}
${weakAreas.length ? 'Test weak areas: ' + JSON.stringify(weakAreas) : ''}
Create personalized 4-week learning roadmap.
Return ONLY valid JSON no markdown no backticks:
{
"currentMatchPercent": 40,
"targetMatchPercent": 85,
"skillsAlreadyHave": ["list matching skills"],
"skillsToAdd": ["list of missing skills to learn"],
"learningResources": [
  {"skill":"skill name","course":"course name",
   "platform":"Udemy/Coursera/YouTube/freeCodeCamp",
   "link":"https://real-url.com","durationWeeks":3}
],
"resumeTips": ["specific tip 1","specific tip 2","tip 3"],
"weeklyPlan": [
  {"week":1,"focus":"topic","tasks":["task1","task2","task3"]}
],
"interviewTopics": ["topic1","topic2","topic3"],
"estimatedReadyDate": "6-8 weeks"
}`;

    let roadmap;
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 20000))
      ]);
      roadmap = JSON.parse(
        result.response.text().replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (aiErr) {
      console.log('Gemini roadmap failed, using fallback:', aiErr.message);
      const uLow = userSkills.map(s => s.toLowerCase());
      const allSkills = ['React', 'Node.js', 'Python', 'Java', 'SQL', 'Docker', 'AWS', 'TypeScript', 'Git', 'MongoDB'];
      const have = allSkills.filter(s => uLow.includes(s.toLowerCase()));
      const missing = allSkills.filter(s => !uLow.includes(s.toLowerCase())).slice(0, 5);
      roadmap = {
        currentMatchPercent: Math.min(90, Math.max(20, Math.round((userSkills.length / 10) * 100))),
        targetMatchPercent: 85,
        skillsAlreadyHave: userSkills.slice(0, 6),
        skillsToAdd: missing,
        learningResources: [
          { skill: 'Full Stack', course: 'The Complete Web Developer Bootcamp', platform: 'Udemy', link: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/', durationWeeks: 4 },
          { skill: 'DSA', course: 'Data Structures & Algorithms', platform: 'YouTube', link: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationWeeks: 3 }
        ],
        resumeTips: [
          'Quantify achievements with numbers (e.g. "Reduced load time by 40%")',
          'Add GitHub project links with live demos',
          'List tech stack prominently at the top'
        ],
        weeklyPlan: [
          { week: 1, focus: 'Core Skills Review', tasks: ['Review ' + (userSkills[0] || 'JavaScript') + ' fundamentals', 'Solve 10 LeetCode easy problems', 'Build a small CRUD project'] },
          { week: 2, focus: 'Missing Skills: ' + (missing[0] || 'Cloud'), tasks: ['Start ' + (missing[0] || 'AWS') + ' course', 'Complete 3 hands-on labs', 'Document learnings in GitHub'] },
          { week: 3, focus: 'Portfolio Project', tasks: ['Build a full-stack project using ' + jobRole + ' stack', 'Deploy on Vercel/Heroku', 'Write a README with screenshots'] },
          { week: 4, focus: 'Interview Preparation', tasks: ['Practice 20 mock interview questions', 'Review system design basics', 'Do 2 mock interviews with peers'] }
        ],
        interviewTopics: ['Data Structures & Algorithms', 'System Design Basics', 'OOP Concepts', 'SQL Queries & Joins', jobRole + ' specific questions'],
        estimatedReadyDate: '6-8 weeks'
      };
    }

    await pool.query('DELETE FROM suggestions WHERE user_id=$1', [userId]);
    await pool.query(
      'INSERT INTO suggestions(user_id,job_id,roadmap) VALUES($1,$2,$3)',
      [userId, jobId, JSON.stringify(roadmap)]);
    return res.json({ success: true, roadmap, jobRole });
  } catch (err) {
    console.error('Roadmap error:', err.message);
    return res.status(500).json({ error: 'Roadmap failed: ' + err.message });
  }
});

module.exports = router;
