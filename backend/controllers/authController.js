const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const signToken = (user) => jwt.sign(
  { id:user.id, username:user.username, 
    email:user.email, role:user.role },
  process.env.JWT_SECRET || 'supersecretkey',
  { expiresIn:'7d' }
);

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({error:'Username and password required'});

    const result = await pool.query(
      `SELECT * FROM users 
       WHERE LOWER(username)=LOWER($1) OR LOWER(email)=LOWER($1)`,
      [username]
    );

    if (result.rows.length === 0)
      return res.status(401).json({error:'User not found'});

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({error:'Invalid password'});

    const token = signToken(user);
    return res.json({
      success:true, token,
      user:{id:user.id, username:user.username, 
            email:user.email, role:user.role}
    });
  } catch(err) {
    console.error('LOGIN ERROR:', err.message, err.stack);
    return res.status(500).json({error:'Login failed: '+err.message});
  }
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, role='job_finder' } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({error:'All fields required'});

    const exists = await pool.query(
      'SELECT id FROM users WHERE username=$1 OR email=$2',
      [username, email]
    );
    if (exists.rows.length > 0)
      return res.status(400).json({error:'User already exists'});

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username,email,password,role) 
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [username, email, hashed, role]
    );
    const user = result.rows[0];

    if (role === 'job_finder') {
      await pool.query(
        `INSERT INTO job_finder_profiles (user_id) 
         VALUES ($1) ON CONFLICT DO NOTHING`,
        [user.id]
      );
    }

    const token = signToken(user);
    return res.status(201).json({
      success:true, token,
      user:{id:user.id, username:user.username, 
            email:user.email, role:user.role}
    });
  } catch(err) {
    console.error('REGISTER ERROR:', err.message);
    return res.status(500).json({error:'Register failed: '+err.message});
  }
};

exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id,username,email,role FROM users WHERE id=$1',
      [req.user.id]
    );
    if (!result.rows.length)
      return res.status(404).json({error:'User not found'});
    return res.json({success:true, user:result.rows[0]});
  } catch(err) {
    return res.status(500).json({error:err.message});
  }
};
