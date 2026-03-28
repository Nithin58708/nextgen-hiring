const { pool } = require('../db');

exports.getStats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM jobs) as total_jobs,
        (SELECT COUNT(*)::int FROM jobs WHERE status='pending') as pending_jobs,
        (SELECT COUNT(*)::int FROM jobs WHERE status='approved') as approved_jobs,
        (SELECT COUNT(*)::int FROM users WHERE role='job_finder') as total_finders,
        (SELECT COUNT(*)::int FROM users WHERE role='job_poster') as total_posters,
        (SELECT COUNT(*)::int FROM users WHERE role='admin') as total_admins,
        (SELECT COUNT(*)::int FROM job_applications) as total_applications,
        (SELECT COUNT(*)::int FROM resumes) as resumes_uploaded,
        (SELECT COUNT(*)::int FROM job_matches) as total_matches,
        (SELECT COUNT(*)::int FROM assessment_results) as tests_taken
    `);
    return res.json({success:true, ...result.rows[0]});
  } catch(err) {
    return res.status(500).json({error:err.message});
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, u.username as poster_name,
       COUNT(ja.id)::int as applicant_count
       FROM jobs j
       LEFT JOIN users u ON j.posted_by=u.id
       LEFT JOIN job_applications ja ON j.id=ja.job_id
       GROUP BY j.id, u.username
       ORDER BY j.created_at DESC`
    );
    return res.json({success:true, jobs:result.rows});
  } catch(err) {
    return res.status(500).json({error:err.message});
  }
};

exports.approveJob = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE jobs SET status='approved' WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    if (!result.rows.length)
      return res.status(404).json({error:'Job not found'});

    // Email poster
    try {
      const job = result.rows[0];
      const poster = await pool.query(
        'SELECT username,email FROM users WHERE id=$1', [job.posted_by]
      );
      if (poster.rows.length) {
        const emailService = require('../services/emailService');
        await emailService.sendEmail({
          to: poster.rows[0].email,
          subject: `✅ Job Approved: ${job.title} is now live!`,
          text: `Hi ${poster.rows[0].username},\n\nYour job "${job.title}" ` +
            `has been approved and is now visible to all students.\n— NextGen Hiring`
        });
      }
    } catch(e) { console.log('Approval email failed:', e.message); }

    return res.json({success:true, job:result.rows[0]});
  } catch(err) {
    return res.status(500).json({error:err.message});
  }
};

exports.rejectJob = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE jobs SET status='rejected' WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    if (!result.rows.length)
      return res.status(404).json({error:'Job not found'});
    return res.json({success:true, job:result.rows[0]});
  } catch(err) {
    return res.status(500).json({error:err.message});
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, role, created_at 
       FROM users ORDER BY created_at DESC`
    );
    return res.json({success:true, users:result.rows});
  } catch(err) {
    return res.status(500).json({error:err.message});
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(password || 'admin', 10);
    const result = await pool.query(
      `INSERT INTO users (username,email,password,role) 
       VALUES ($1,$2,$3,$4) RETURNING id,username,email,role`,
      [username, email, hashed, role || 'job_finder']
    );
    return res.status(201).json({success:true, user:result.rows[0]});
  } catch(err) {
    return res.status(500).json({error:err.message});
  }
};

exports.updateUser = async (req, res) => {
  try {
    const {username, email, role} = req.body;
    const result = await pool.query(
      `UPDATE users SET 
         username=COALESCE($1,username),
         email=COALESCE($2,email),
         role=COALESCE($3,role)
       WHERE id=$4 RETURNING id,username,email,role`,
      [username, email, role, req.params.id]
    );
    if (!result.rows.length)
      return res.status(404).json({error:'User not found'});
    return res.json({success:true, user:result.rows[0]});
  } catch(err) {
    return res.status(500).json({error:err.message});
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT role FROM users WHERE id=$1', [req.params.id]
    );
    if (user.rows[0]?.role === 'admin')
      return res.status(403).json({error:'Cannot delete admin user'});
    
    await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    return res.json({success:true, message:'User deleted'});
  } catch(err) {
    return res.status(500).json({error:err.message});
  }
};
