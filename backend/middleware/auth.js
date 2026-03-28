const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const header = req.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token)
      return res.status(401).json({ error: 'No token provided' });
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    next();
  } catch(err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

auth.requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ error: 'Admin access required' });
  next();
};

module.exports = auth;
