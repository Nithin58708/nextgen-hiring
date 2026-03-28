const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { pool } = require('./db');

async function runTest() {
  try {
    const loginRes = await axios.post('http://localhost:5005/api/auth/login', {
      username: 'Karthi',
      password: 'admin'
    });
    const token = loginRes.data.token;
    console.log('Got Auth Token');

    const form = new FormData();
    form.append('resume', fs.createReadStream('./uploads/test-resume.pdf'));
    
    console.log('Uploading...', !!token);
    const upRes = await axios.post('http://localhost:5005/api/resume/upload', form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` }
    });
    console.log('Upload success');
    console.log(JSON.stringify(upRes.data, null, 2));
    
    const dbCheck = await pool.query("SELECT * FROM user_skills WHERE user_id = 7");
    console.log('User skills count in DB:', dbCheck.rows.length);
  } catch (err) {
    if (err.response) {
      console.error('API Error:', err.response.data);
    } else {
      console.error('Network/DB Error:', err.message);
    }
  } finally {
    process.exit();
  }
}
runTest();
