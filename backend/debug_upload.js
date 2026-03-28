const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { pool } = require('./db');

async function testResumeUpload() {
  try {
    // 1. Login as Karthi (Job Finder) to get token
    // The prompt says: "Login as Karthi / admin"
    // Users are seeded, let's find karthi's email first
    const userRes = await pool.query("SELECT * FROM users");
    console.log(userRes.rows);
    const user = userRes.rows.find(u => u.email === 'karthi@test.com' || u.username === 'Karthi' || u.email === 'Karthi' || u.name === 'Karthi' || u.display_name === 'Karthi' || u.email.toLowerCase().includes('karthi'));
    if (!user) {
      console.log('Test Failed: Karthi user not found');
      return;
    }
    
    console.log('Logging in as', user.email || user.username);
    const loginRes = await axios.post('http://localhost:5005/api/auth/login', {
      email: user.email || user.username,
      password: 'admin'
    });
    
    const token = loginRes.data.token;
    console.log('Got token:', !!token);

    // 2. Upload test-resume.pdf
    const filePath = './uploads/test-resume.pdf';
    if (!fs.existsSync(filePath)) {
      console.log('Test file not found:', filePath);
      return;
    }
    
    const form = new FormData();
    form.append('resume', fs.createReadStream(filePath));
    
    console.log('Uploading resume...');
    const uploadRes = await axios.post('http://localhost:5005/api/resume/upload', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Upload response status:', uploadRes.status);
    console.log('Extracted skills:', uploadRes.data.skills);
    
    if (!uploadRes.data.skills || uploadRes.data.skills.length < 8) {
      console.log('FAILED: Less than 8 skills extracted or no skills returned');
      console.log(uploadRes.data);
    } else {
      console.log('SUCCESS: Extracted >= 8 skills');
    }

    // 3. Verify Database
    const skillsRes = await pool.query('SELECT * FROM user_skills WHERE user_id = $1', [user.id]);
    console.log(`Database verification: Found ${skillsRes.rows.length} skills in user_skills`);
    
    const resumeRes = await pool.query('SELECT * FROM resumes WHERE user_id = $1', [user.id]);
    console.log(`Database verification: Found ${resumeRes.rows.length} resumes in database`);
    
    const profileRes = await pool.query('SELECT * FROM job_finder_profiles WHERE user_id = $1', [user.id]);
    console.log('Database verification: Profile primary_job_role:', profileRes.rows[0]?.primary_job_role);
    
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else {
      console.error('Test Error:', error.message);
    }
  } finally {
    process.exit();
  }
}

testResumeUpload();
