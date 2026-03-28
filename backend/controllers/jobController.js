const { pool } = require('../db');
const axios = require('axios');

exports.getApprovedJobs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, u.username as poster_name,
       COUNT(ja.id)::int as applicant_count
       FROM jobs j
       LEFT JOIN users u ON j.posted_by=u.id
       LEFT JOIN job_applications ja ON j.id=ja.job_id
       WHERE j.status='approved'
       GROUP BY j.id, u.username
       ORDER BY j.created_at DESC`
    );
    return res.json({success:true, jobs:result.rows});
  } catch(err) {
    console.error('getApprovedJobs error:', err.message);
    return res.status(500).json({error:err.message});
  }
};

exports.createJob = async (req, res) => {
  try {
    // Accept all possible field name formats
    const title = req.body.title
      || req.body.jobTitle
      || req.body.job_title
      || req.body.jobRole
      || req.body.job_role
      || req.body['Job Role']
      || req.body.role;

    const company = req.body.company
      || req.body.companyName
      || req.body.company_name
      || req.body['Company Name'];

    const description = req.body.description
      || req.body.jobDescription
      || req.body.job_description
      || '';

    const salary = req.body.salary
      || req.body.salaryPackage
      || req.body.salary_package
      || '';

    const location = req.body.location
      || req.body.jobLocation
      || '';

    const requiredSkills = req.body.requiredSkills
      || req.body.required_skills
      || req.body.skills
      || req.body.skillsRequired
      || [];

    console.log('createJob received:', JSON.stringify(req.body));
    console.log('Parsed title:', title, 'company:', company);

    if (!title || !company) {
      return res.status(400).json({
        error: 'Title and company required',
        received_keys: Object.keys(req.body),
        received_body: req.body
      });
    }

    const result = await pool.query(
      `INSERT INTO jobs 
         (title, company, description, salary, location,
          required_skills, status, posted_by, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,'pending',$7,NOW())
       RETURNING *`,
      [title, company, description, salary, location,
       JSON.stringify(Array.isArray(requiredSkills) 
         ? requiredSkills : [requiredSkills]),
       req.user.id]
    );

    // Email admin
    try {
      const emailService = require('../services/emailService');
      await emailService.sendEmail({
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `New Job Posted — Review: ${title}`,
        text: `${req.user.username} posted "${title}" at ${company}. Review in admin panel.`
      });
    } catch(e) { console.log('Email skip:', e.message); }

    return res.status(201).json({
      success: true,
      job: result.rows[0],
      message: 'Job posted successfully. Pending admin approval.'
    });
  } catch(err) {
    console.error('createJob error:', err.message);
    return res.status(500).json({error: err.message});
  }
};

exports.applyForJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;
    const {coverLetter} = req.body;

    // Check already applied
    const existing = await pool.query(
      'SELECT id FROM job_applications WHERE job_id=$1 AND user_id=$2',
      [jobId, userId]
    );
    if (existing.rows.length > 0)
      return res.status(400).json({error:'Already applied to this job'});

    // Insert application
    const appResult = await pool.query(
      `INSERT INTO job_applications 
         (job_id,user_id,cover_letter,status,applied_at)
       VALUES ($1,$2,$3,'applied',NOW()) RETURNING *`,
      [jobId, userId, coverLetter||'']
    );

    // Calculate match score
    const userSkills = await pool.query(
      'SELECT skill_name FROM user_skills WHERE user_id=$1', [userId]
    );
    const job = await pool.query(
      'SELECT * FROM jobs WHERE id=$1', [jobId]
    );
    
    if (job.rows.length > 0) {
      const jobSkills = job.rows[0].required_skills || [];
      const uSkills = userSkills.rows.map(r=>r.skill_name.toLowerCase());
      const matched = jobSkills.filter(s=>uSkills.includes(s.toLowerCase()));
      const score = jobSkills.length > 0
        ? Math.round((matched.length/jobSkills.length)*100) : 50;

      await pool.query(
        `INSERT INTO job_matches 
           (user_id,job_id,score,matched_skills,missing_skills,created_at)
         VALUES ($1,$2,$3,$4,$5,NOW())
         ON CONFLICT (user_id, job_id) DO UPDATE SET
         score=$3, matched_skills=$4, missing_skills=$5`,
        [userId, jobId, score,
         JSON.stringify(matched),
         JSON.stringify(jobSkills.filter(s=>
           !uSkills.includes(s.toLowerCase())))]
      );
    }

    // Send emails
    try {
      const emailService = require('../services/emailService');
      const userResult = await pool.query(
        'SELECT username,email FROM users WHERE id=$1', [userId]
      );
      const jobResult = await pool.query(
        `SELECT j.*,u.email as poster_email,u.username as poster_name 
         FROM jobs j LEFT JOIN users u ON j.posted_by=u.id 
         WHERE j.id=$1`, [jobId]
      );
      
      if (jobResult.rows.length > 0) {
        const jobData = jobResult.rows[0];
        const applicant = userResult.rows[0];
        
        // Email to poster
        if (jobData.poster_email) {
          await emailService.sendEmail({
            to: jobData.poster_email,
            subject: `New Application: ${jobData.title} from ${applicant.username}`,
            text: `Hello ${jobData.poster_name},\n\n` +
              `${applicant.username} applied for ${jobData.title} at ${jobData.company}.\n` +
              `Cover Letter: ${coverLetter}\n\n` +
              `Review in your NextGen Hiring dashboard.\n— NextGen Hiring`
          });
        }
        
        // Email to applicant
        await emailService.sendEmail({
          to: applicant.email,
          subject: `Application Submitted: ${jobData.title} at ${jobData.company}`,
          text: `Hi ${applicant.username},\n\n` +
            `Your application for ${jobData.title} at ${jobData.company} ` +
            `was submitted successfully!\n\n` +
            `We'll notify you when the employer responds.\n— NextGen Hiring`
        });
      }
    } catch(emailErr) {
      console.log('Email send failed (non-critical):', emailErr.message);
    }

    return res.json({
      success:true,
      application:appResult.rows[0],
      message:'Application submitted successfully!'
    });
  } catch(err) {
    console.error('applyForJob error:', err.message);
    return res.status(500).json({error:err.message});
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ja.*, j.title, j.company, j.location, j.salary,
       jm.score as match_score
       FROM job_applications ja
       JOIN jobs j ON ja.job_id=j.id
       LEFT JOIN job_matches jm ON jm.job_id=ja.job_id 
         AND jm.user_id=ja.user_id
       WHERE ja.user_id=$1
       ORDER BY ja.applied_at DESC`,
      [req.user.id]
    );
    return res.json({success:true, applications:result.rows});
  } catch(err) {
    return res.status(500).json({error:err.message});
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const status = (req.body.status || '').trim().toLowerCase();
    const appId = req.params.id;
    const validStatuses = ['applied','shortlisted','rejected','hired'];
    if (!validStatuses.includes(status))
      return res.status(400).json({error:'Invalid status'});

    const result = await pool.query(
      `UPDATE job_applications SET status=$1, updated_at=NOW()
       WHERE id=$2 RETURNING *`,
      [status, appId]
    );
    if (!result.rows.length)
      return res.status(404).json({error:'Application not found'});

    // Send email to applicant
    try {
      const app = result.rows[0];
      const applicant = await pool.query(
        'SELECT username,email FROM users WHERE id=$1', [app.user_id]
      );
      const job = await pool.query(
        'SELECT title,company FROM jobs WHERE id=$1', [app.job_id]
      );
      
      if (applicant.rows.length && job.rows.length) {
        const emailService = require('../services/emailService');
        const statusMessages = {
          shortlisted: `🎉 Congratulations! You've been shortlisted for ${job.rows[0].title}.`,
          rejected: `Thank you for applying to ${job.rows[0].title}. Unfortunately you were not selected.`,
          hired: `🎊 Amazing news! You've been selected for ${job.rows[0].title} at ${job.rows[0].company}!`
        };
        if (statusMessages[status]) {
          await emailService.sendEmail({
            to: applicant.rows[0].email,
            subject: `Application Update: ${job.rows[0].title} — ${status.toUpperCase()}`,
            text: statusMessages[status] + '\n\n— NextGen Hiring Platform'
          });
        }
      }
    } catch(emailErr) {
      console.log('Status email failed:', emailErr.message);
    }

    return res.json({success:true, application:result.rows[0]});
  } catch(err) {
    return res.status(500).json({error:err.message});
  }
};

exports.getMyJobs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, COUNT(ja.id)::int as applicant_count
       FROM jobs j LEFT JOIN job_applications ja ON j.id=ja.job_id
       WHERE j.posted_by=$1 GROUP BY j.id ORDER BY j.created_at DESC`,
      [req.user.id]
    );
    return res.json({success:true, jobs:result.rows});
  } catch(err) {
    return res.status(500).json({error:err.message});
  }
};

exports.getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    const result = await pool.query(
      `SELECT ja.*, u.username, u.email,
       jm.score as match_score, jm.matched_skills, jm.missing_skills
       FROM job_applications ja
       JOIN users u ON ja.user_id=u.id
       LEFT JOIN job_matches jm ON jm.user_id=ja.user_id AND jm.job_id=ja.job_id
       WHERE ja.job_id=$1
       ORDER BY jm.score DESC`,
      [jobId]
    );
    return res.json({success:true, applicants:result.rows});
  } catch(err) {
    return res.status(500).json({error:err.message});
  }
};

exports.fetchLiveJobs = async (req, res) => {
  try {
    let jobRole = req.query.role || 'Software Engineer';
    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params: { query: `${jobRole} fresher India`, page: '1', num_pages: '1' },
      headers: { 'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, 'X-RapidAPI-Host': 'jsearch.p.rapidapi.com' }
    });
    return res.json({ success: true, jobs: response.data.data });
  } catch (error) {
    return res.status(503).json({ error: error.message });
  }
};
