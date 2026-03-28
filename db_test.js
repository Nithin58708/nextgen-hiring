const { pool } = require('./backend/db');
(async () => {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to Postgres');
        const res = await client.query('SELECT NOW()');
        console.log('Result:', res.rows[0]);
        client.release();
        process.exit(0);
    } catch (err) {
        console.error('Connection Error:', err);
        process.exit(1);
    }
})();
