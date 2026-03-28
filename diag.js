const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });
console.log('Testing URL:', process.env.DATABASE_URL);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
    try {
        const client = await pool.connect();
        console.log('Success!');
        const res = await client.query('SELECT current_database()');
        console.log('DB:', res.rows[0]);
        client.release();
        process.exit(0);
    } catch (e) {
        console.error('FULL ERROR:', e);
        process.exit(1);
    }
})();
