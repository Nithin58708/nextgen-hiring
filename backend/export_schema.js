require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function exportSchema() {
  const r = await pool.query("SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name, ordinal_position");
  
  let output = '';
  let currentTable = '';
  
  r.rows.forEach(row => {
    if (row.table_name !== currentTable) {
      currentTable = row.table_name;
      output += `\nTABLE: ${currentTable}\n`;
    }
    output += `  - ${row.column_name}\n`;
  });
  
  fs.writeFileSync('schema_dump.txt', output);
  console.log('Schema exported to schema_dump.txt');
  await pool.end();
}

exportSchema().catch(err => {
  console.error(err);
  pool.end();
});
