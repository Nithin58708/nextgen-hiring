const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../db');
const axios = require('axios');

router.get('/live', auth, async (req, res) => {
  try {
    let role = req.query.role || req.query.jobRole;
    if (!role) {
      const p = await pool.query(
        'SELECT primary_job_role FROM job_finder_profiles WHERE user_id=$1',
        [req.user.id]);
      role = p.rows[0]?.primary_job_role || 'Software Engineer';
    }
    const r = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params: { query:role+' fresher India', page:'1', num_pages:'1' },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      },
      timeout: 12000
    });
    if (!r.data?.data?.length)
      return res.status(404).json({ success:false, error:'No jobs found for: '+role });
    const jobs = r.data.data.map(j => ({
      id: j.job_id,
      title: j.job_title,
      company: j.employer_name,
      location: [j.job_city, j.job_country].filter(Boolean).join(', '),
      salary: j.job_min_salary
        ? j.job_min_salary+'-'+j.job_max_salary+' '+(j.job_salary_currency||'INR')
        : 'Not disclosed',
      experience: j.job_required_experience_in_months
        ? Math.ceil(j.job_required_experience_in_months/12)+'+ years'
        : 'Fresher',
      skills: j.job_required_skills || [],
      applyLink: j.job_apply_link,
      source: j.job_apply_link?.includes('linkedin') ? 'LinkedIn'
            : j.job_apply_link?.includes('naukri') ? 'Naukri'
            : j.job_apply_link?.includes('indeed') ? 'Indeed'
            : 'Official Careers',
      postedDate: j.job_posted_at_datetime_utc,
      description: (j.job_description||'').substring(0,250)
    }));
    return res.json({ success:true, jobs, total:jobs.length, role });
  } catch(err) {
    return res.status(503).json({
      success:false,
      error:'Live job search failed: '+err.message
    });
  }
});

router.get('/my-jobs', auth, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT j.*, COUNT(ja.id)::int as applicant_count
       FROM jobs j LEFT JOIN job_applications ja ON j.id=ja.job_id
       WHERE j.posted_by=$1 GROUP BY j.id ORDER BY j.created_at DESC`,
      [req.user.id]);
    return res.json(r.rows);
  } catch(err) { return res.status(500).json({ error:err.message }); }
});

router.get('/my-applications', auth, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT ja.*,j.title,j.company,j.location,j.salary,
       jm.score as match_score
       FROM job_applications ja
       JOIN jobs j ON ja.job_id=j.id
       LEFT JOIN job_matches jm ON jm.job_id=ja.job_id AND jm.user_id=ja.user_id
       WHERE ja.user_id=$1 ORDER BY ja.applied_at DESC`,
      [req.user.id]);
    return res.json(r.rows);
  } catch(err) { return res.status(500).json({ error:err.message }); }
});

router.get('/', auth, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT j.*,u.username as poster_name,COUNT(ja.id)::int as applicant_count
       FROM jobs j LEFT JOIN users u ON j.posted_by=u.id
       LEFT JOIN job_applications ja ON j.id=ja.job_id
       WHERE j.status='approved'
       GROUP BY j.id,u.username ORDER BY j.created_at DESC`);
    return res.json(r.rows);
  } catch(err) { return res.status(500).json({ error:err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const title = req.body.title||req.body.jobTitle||req.body.job_title||req.body.job_role;
    const company = req.body.company||req.body.companyName||req.body.company_name;
    const description = req.body.description||req.body.jobDescription||req.body.job_description||'';
    const salary = req.body.salary||req.body.salaryPackage||req.body.salary_package||'';
    const location = req.body.location||req.body.jobLocation||'';
    const skills = req.body.requiredSkills||req.body.required_skills||req.body.skills||[];
    if (!title||!company)
      return res.status(400).json({ error:'Title and company required' });
    const r = await pool.query(
      `INSERT INTO jobs(title,company,description,salary,location,
        required_skills,status,posted_by,created_at)
       VALUES($1,$2,$3,$4,$5,$6,'pending',$7,NOW()) RETURNING *`,
      [title,company,description,salary,location,
       JSON.stringify(Array.isArray(skills)?skills:[]),req.user.id]);
    try {
      const es = require('../services/emailService');
      const admin = await pool.query("SELECT email FROM users WHERE role='admin' LIMIT 1");
      if (admin.rows.length) {
        await es.sendEmail({
          to: admin.rows[0].email,
          subject: 'New Job Posted — Review Required: ' + title,
          text: 'A new job has been posted by ' + req.user.username + ' and requires your approval.\n\nJob: ' + title + ' at ' + company + '\n\nLogin to admin dashboard to approve or reject.'
        });
      }
    } catch(e) {}
    return res.status(201).json({ success:true, job:r.rows[0] });
  } catch(err) { return res.status(500).json({ error:err.message }); }
});

router.post('/:id/apply', auth, async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;
    const coverLetter = req.body.coverLetter||req.body.cover_letter||'';
    const existing = await pool.query(
      'SELECT id FROM job_applications WHERE job_id=$1 AND user_id=$2',
      [jobId,userId]);
    if (existing.rows.length)
      return res.status(400).json({ error:'Already applied to this job' });
    const r = await pool.query(
      `INSERT INTO job_applications(job_id,user_id,cover_letter,status,applied_at)
       VALUES($1,$2,$3,'applied',NOW()) RETURNING *`,
      [jobId,userId,coverLetter]);
    try {
      const skills = await pool.query(
        'SELECT skill_name FROM user_skills WHERE user_id=$1',[userId]);
      const job = await pool.query('SELECT * FROM jobs WHERE id=$1',[jobId]);
      if (job.rows.length) {
        const jSkills = Array.isArray(job.rows[0].required_skills)
          ? job.rows[0].required_skills
          : JSON.parse(job.rows[0].required_skills||'[]');
        const uLow = skills.rows.map(s=>s.skill_name.toLowerCase());
        const matched = jSkills.filter(s=>uLow.includes(s.toLowerCase()));
        const score = jSkills.length>0
          ? Math.round((matched.length/jSkills.length)*100) : 50;
        await pool.query(
          `INSERT INTO job_matches(user_id,job_id,score,matched_skills,missing_skills,created_at)
           VALUES($1,$2,$3,$4,$5,NOW()) ON CONFLICT DO NOTHING`,
          [userId,jobId,score,JSON.stringify(matched),
           JSON.stringify(jSkills.filter(s=>!uLow.includes(s.toLowerCase())))]);
      }
    } catch(e) {}
    try {
      const es = require('../services/emailService');
      await es.sendApplicationEmails(userId,jobId,coverLetter,pool);
    } catch(e) {}
    return res.json({ success:true, application:r.rows[0] });
  } catch(err) { return res.status(500).json({ error:err.message }); }
});

router.get('/:id/applicants', auth, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT ja.*, ja.user_id as finder_id, u.username, u.email,
       jm.score as match_score, jm.matched_skills, jm.missing_skills
       FROM job_applications ja JOIN users u ON ja.user_id=u.id
       LEFT JOIN job_matches jm ON jm.user_id=ja.user_id AND jm.job_id=ja.job_id
       WHERE ja.job_id=$1 ORDER BY jm.score DESC NULLS LAST`,
      [req.params.id]);
    return res.json(r.rows);
  } catch(err) { return res.status(500).json({ error:err.message }); }
});

router.patch('/applications/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['applied','shortlisted','rejected','hired'].includes(status))
      return res.status(400).json({ error:'Invalid status' });
    const r = await pool.query(
      'UPDATE job_applications SET status=$1,updated_at=NOW() WHERE id=$2 RETURNING *',
      [status,req.params.id]);
    if (!r.rows.length)
      return res.status(404).json({ error:'Application not found' });
    try {
      const es = require('../services/emailService');
      await es.sendStatusUpdateEmail(req.params.id,status,pool);
    } catch(e) {}
    return res.json({ success:true, application:r.rows[0] });
  } catch(err) { return res.status(500).json({ error:err.message }); }
});

module.exports = router;
