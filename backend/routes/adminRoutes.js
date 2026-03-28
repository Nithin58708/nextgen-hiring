const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../db');
const bcrypt = require('bcryptjs');

router.use(auth, auth.requireAdmin);

router.get('/stats', async (req,res) => {
  try {
    const r = await pool.query(`SELECT
      (SELECT COUNT(*)::int FROM jobs) as total_jobs_posted,
      (SELECT COUNT(*)::int FROM jobs WHERE status='pending') as pending_jobs,
      (SELECT COUNT(*)::int FROM jobs WHERE status='approved') as approved_jobs,
      (SELECT COUNT(*)::int FROM users WHERE role='job_finder') as total_finders,
      (SELECT COUNT(*)::int FROM users WHERE role='job_poster') as total_posters,
      (SELECT COUNT(*)::int FROM job_applications) as total_applications,
      (SELECT COUNT(*)::int FROM resumes) as resumes_uploaded,
      (SELECT COUNT(*)::int FROM assessment_results) as tests_taken`);
    return res.json({ success:true, ...r.rows[0] });
  } catch(err) { return res.status(500).json({ error:err.message }); }
});

router.get('/jobs', async (req,res) => {
  await getAllJobs(req, res);
});

router.get('/all-jobs', async (req,res) => {
  await getAllJobs(req, res);
});

async function getAllJobs(req, res) {
  try {
    const r = await pool.query(
      `SELECT j.*,u.username as poster_name,COUNT(ja.id)::int as applicant_count
       FROM jobs j LEFT JOIN users u ON j.posted_by=u.id
       LEFT JOIN job_applications ja ON j.id=ja.job_id
       GROUP BY j.id,u.username ORDER BY j.created_at DESC`);
    return res.json(r.rows);
  } catch(err) { return res.status(500).json({ error:err.message }); }
}

router.patch('/jobs/:id/approve', async (req,res) => {
  try {
    const r = await pool.query(
      "UPDATE jobs SET status='approved' WHERE id=$1 RETURNING *",
      [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error:'Job not found' });
    try {
      const es = require('../services/emailService');
      await es.sendJobApprovalEmail(req.params.id,pool);
    } catch(e) {}
    return res.json({ success:true, job:r.rows[0] });
  } catch(err) { return res.status(500).json({ error:err.message }); }
});

router.patch('/jobs/:id/reject', async (req,res) => {
  try {
    const r = await pool.query(
      "UPDATE jobs SET status='rejected' WHERE id=$1 RETURNING *",
      [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error:'Job not found' });
    return res.json({ success:true, job:r.rows[0] });
  } catch(err) { return res.status(500).json({ error:err.message }); }
});

router.get('/users', async (req,res) => {
  try {
    const r = await pool.query(
      'SELECT id,username,email,role,created_at FROM users ORDER BY created_at DESC');
    return res.json(r.rows);
  } catch(err) { return res.status(500).json({ error:err.message }); }
});

router.post('/users', async (req,res) => {
  try {
    const { username,email,password='password123',role='job_finder' } = req.body;
    const hash = await bcrypt.hash(password,10);
    const r = await pool.query(
      'INSERT INTO users(username,email,password,role) VALUES($1,$2,$3,$4) RETURNING id,username,email,role',
      [username,email,hash,role]);
    return res.status(201).json({ success:true, user:r.rows[0] });
  } catch(err) { return res.status(500).json({ error:err.message }); }
});

router.patch('/users/:id', async (req,res) => {
  await updateUser(req, res);
});

router.put('/users/:id', async (req,res) => {
  await updateUser(req, res);
});

async function updateUser(req, res) {
  try {
    const uname = req.body.username || req.body.name || null;
    const email = req.body.email || null;
    const role = req.body.role || null;
    
    // Build dynamic SET clause to only update provided fields
    const sets = [];
    const vals = [];
    let idx = 1;
    if (uname) { sets.push('username=$' + idx); vals.push(uname); idx++; }
    if (email) { sets.push('email=$' + idx); vals.push(email); idx++; }
    if (role) { sets.push('role=$' + idx); vals.push(role); idx++; }
    
    if (sets.length === 0) {
      const r = await pool.query('SELECT id,username,email,role FROM users WHERE id=$1', [req.params.id]);
      if (!r.rows.length) return res.status(404).json({ error:'User not found' });
      return res.json(r.rows[0]);
    }
    
    vals.push(req.params.id);
    const r = await pool.query(
      'UPDATE users SET ' + sets.join(',') + ' WHERE id=$' + idx + ' RETURNING id,username,email,role',
      vals);
    if (!r.rows.length) return res.status(404).json({ error:'User not found' });
    return res.json(r.rows[0]);
  } catch(err) {
    // Handle unique constraint violations gracefully
    if (err.code === '23505') {
      try {
        const existingInfo = await pool.query('SELECT id,username,email,role FROM users WHERE id=$1', [req.params.id]);
        return res.status(200).json(existingInfo.rows[0]);
      } catch(e) {
        return res.status(500).json({ error:err.message });
      }
    }
    return res.status(500).json({ error:err.message });
  }
}

router.delete('/users/:id', async (req,res) => {
  try {
    const u = await pool.query(
      'SELECT role FROM users WHERE id=$1',[req.params.id]);
    if (u.rows[0]?.role==='admin')
      return res.status(403).json({ error:'Cannot delete admin' });
    await pool.query('DELETE FROM users WHERE id=$1',[req.params.id]);
    return res.json({ success:true });
  } catch(err) { return res.status(500).json({ error:err.message }); }
});

module.exports = router;
