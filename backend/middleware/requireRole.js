module.exports = (role) => (req, res, next) => {
  if (req.user.role !== role && req.user.role !== 'admin') {
    return res.status(403).json({
      error: `Access denied. Required role: ${role}`
    });
  }
  next();
};
