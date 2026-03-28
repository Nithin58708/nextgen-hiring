const { pool } = require('./backend/db');
(async () => {
  try {
    await pool.query('TRUNCATE assessments CASCADE;');
    console.log('Database cleared.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
