const { pool } = require('../db');
const { sendEmail } = require('../services/emailService');

// Job Finder applies for a job
exports.applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const finderId = req.user.id;
    const { cover_letter } = req.body;

    // Check if already applied
    const existing = await pool.query(
      'SELECT id FROM job_applications WHERE job_id=$1 AND finder_id=$2',
      [jobId, finderId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    // Get job and poster details
    const jobRes = await pool.query(
      'SELECT jobs.*, users.email as poster_email, users.name as poster_name FROM jobs LEFT JOIN users ON jobs.poster_id=users.id WHERE jobs.id=$1',
      [jobId]
    );
    if (jobRes.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    const job = jobRes.rows[0];

    // Get finder details
    const finderRes = await pool.query(
      'SELECT name, email FROM users WHERE id=$1',
      [finderId]
    );
    const finder = finderRes.rows[0];

    // Save application
    const result = await pool.query(
      `INSERT INTO job_applications (job_id, finder_id, poster_id, cover_letter, status)
       VALUES ($1, $2, $3, $4, 'applied') RETURNING *`,
      [jobId, finderId, job.poster_id, cover_letter || '']
    );

    // Send email to job poster
    try {
        await sendEmail(
            job.poster_email,
            `New Application for ${job.job_role} - NextGen Hiring`,
            `<h2>New Job Application</h2>
             <p><strong>${finder.name}</strong> has applied for your job posting: <strong>${job.job_role}</strong></p>
             <p>Company: ${job.company_name}</p>
             <p>Cover Letter: ${cover_letter || 'No cover letter provided'}</p>
             <p>Login to NextGen Hiring to review this application.</p>`
          );
      
          // Send confirmation to finder
          await sendEmail(
            finder.email,
            `Application Submitted - ${job.job_role} at ${job.company_name}`,
            `<h2>Application Submitted Successfully!</h2>
             <p>You have successfully applied for <strong>${job.job_role}</strong> at <strong>${job.company_name}</strong>.</p>
             <p>The employer will review your application and get back to you.</p>
             <p>Good luck!</p>`
          );
    } catch (emailErr) {
        console.error('Email sending failed, but application was saved:', emailErr.message);
    }

    res.json({ 
      success: true, 
      application: result.rows[0],
      message: 'Application submitted successfully!'
    });
  } catch (err) {
    console.error('Apply error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Job Finder sees all their applications
exports.getMyApplications = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ja.*, j.job_role, j.company_name, j.salary_package, j.status as job_status,
              j.job_description, j.required_skills
       FROM job_applications ja
       LEFT JOIN jobs j ON ja.job_id = j.id
       WHERE ja.finder_id = $1
       ORDER BY ja.applied_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Job Poster sees all applicants for their job
exports.getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;
    const result = await pool.query(
      `SELECT ja.*, u.name as applicant_name, u.email as applicant_email,
              jfp.extracted_skills, jfp.resume_filename,
              jm.match_score
       FROM job_applications ja
       LEFT JOIN users u ON ja.finder_id = u.id
       LEFT JOIN job_finder_profiles jfp ON ja.finder_id = jfp.user_id
       LEFT JOIN job_matches jm ON ja.finder_id = jm.finder_id AND ja.job_id = jm.job_id
       WHERE ja.job_id = $1
       ORDER BY ja.applied_at DESC`,
      [jobId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Job Poster updates application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'shortlisted' | 'rejected' | 'hired'

    const appRes = await pool.query(
      `SELECT ja.*, j.job_role, j.company_name, u.email as finder_email, u.name as finder_name
       FROM job_applications ja
       LEFT JOIN jobs j ON ja.job_id = j.id
       LEFT JOIN users u ON ja.finder_id = u.id
       WHERE ja.id = $1`,
      [id]
    );
    if (appRes.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    const app = appRes.rows[0];

    await pool.query(
      'UPDATE job_applications SET status=$1 WHERE id=$2',
      [status, id]
    );

    // Email the finder about status update
    const statusMessages = {
      shortlisted: 'Congratulations! You have been shortlisted.',
      rejected: 'Thank you for applying. Unfortunately you were not selected.',
      hired: 'Congratulations! You have been selected for the role!'
    };

    try {
        await sendEmail(
            app.finder_email,
            `Application Update: ${app.job_role} at ${app.company_name}`,
            `<h2>Application Status Update</h2>
             <p>Dear ${app.finder_name},</p>
             <p>Your application for <strong>${app.job_role}</strong> at <strong>${app.company_name}</strong> has been updated.</p>
             <p><strong>Status: ${status.toUpperCase()}</strong></p>
             <p>${statusMessages[status] || ''}</p>`
          );
    } catch (emailErr) {
        console.error('Email sending failed for status update:', emailErr.message);
    }

    res.json({ success: true, message: `Application ${status} successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
