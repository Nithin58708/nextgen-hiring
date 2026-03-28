const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const test = async () => {
    try {
        console.log('Testing primitive INSERT...');
        const res = await pool.query("INSERT INTO assessments (job_role, title, questions) VALUES ($1, $2, $3) RETURNING *", 
            ['Test Role', 'Test Title', JSON.stringify([{q:1}])]
        );
        console.log('INSERT SUCCESS:', res.rows[0].id);
        process.exit(0);
    } catch (err) {
        console.error('INSERT FAILED:', err);
        process.exit(1);
    }
};

test();
