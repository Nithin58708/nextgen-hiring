const { pool } = require('./db');
const bcrypt = require('bcryptjs');

async function reset() {
    console.log('Resetting admin password...');
    try {
        const hash = await bcrypt.hash('admin', 10);
        const res = await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, 'nithin58708@gmail.com']);
        console.log('Done. Rows affected:', res.rowCount);
        process.exit(0);
    } catch (e) {
        console.error('Reset failed:', e);
        process.exit(1);
    }
}

reset();
