const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const auth = require('../middleware/auth');

const sign = (user) => jwt.sign(
  { id:user.id, username:user.username, email:user.email, role:user.role },
  process.env.JWT_SECRET || 'supersecretkey',
  { expiresIn: '7d' }
);

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password required' });
    const r = await pool.query(
      'SELECT * FROM users WHERE LOWER(username)=LOWER($1) OR LOWER(email)=LOWER($1)',
      [username]
    );
    if (!r.rows.length)
      return res.status(401).json({ error: 'User not found' });
    const user = r.rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(401).json({ error: 'Wrong password' });
    return res.json({
      success: true,
      token: sign(user),
      user: { id:user.id, username:user.username, email:user.email, role:user.role }
    });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role='job_finder' } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'All fields required' });
    const exists = await pool.query(
      'SELECT id FROM users WHERE username=$1 OR email=$2', [username, email]);
    if (exists.rows.length)
      return res.status(400).json({ error: 'User already exists' });
    const hash = await bcrypt.hash(password, 10);
    const r = await pool.query(
      'INSERT INTO users(username,email,password,role) VALUES($1,$2,$3,$4) RETURNING *',
      [username, email, hash, role]
    );
    const user = r.rows[0];
    if (role === 'job_finder') {
      await pool.query(
        'INSERT INTO job_finder_profiles(user_id) VALUES($1) ON CONFLICT DO NOTHING',
        [user.id]
      );
    }
    return res.status(201).json({
      success: true,
      token: sign(user),
      user: { id:user.id, username:user.username, email:user.email, role:user.role }
    });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT id,username,email,role FROM users WHERE id=$1', [req.user.id]);
    if (!r.rows.length)
      return res.status(404).json({ error: 'User not found' });
    return res.json({ success:true, user:r.rows[0] });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { email, username } = req.body;
    if (!email && !username) return res.status(400).json({ error: 'Email or Username required' });
    
    // Check if email already exists for another user
    if (email) {
      const exists = await pool.query('SELECT id FROM users WHERE email=$1 AND id!=$2', [email, req.user.id]);
      if (exists.rows.length) return res.status(400).json({ error: 'Email already in use' });
    }

    // Check if username already exists for another user
    if (username) {
      const exists = await pool.query('SELECT id FROM users WHERE username=$1 AND id!=$2', [username, req.user.id]);
      if (exists.rows.length) return res.status(400).json({ error: 'Username already taken' });
    }

    const sets = [];
    const vals = [];
    let idx = 1;
    if (email) { sets.push(`email=$${idx++}`); vals.push(email); }
    if (username) { sets.push(`username=$${idx++}`); vals.push(username); }
    vals.push(req.user.id);

    const r = await pool.query(
      `UPDATE users SET ${sets.join(', ')} WHERE id=$${idx} RETURNING id,username,email,role`,
      vals
    );
    
    if (!r.rows.length) return res.status(404).json({ error: 'User not found' });
    
    const user = r.rows[0];
    return res.json({
      success: true,
      token: sign(user),
      user
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
