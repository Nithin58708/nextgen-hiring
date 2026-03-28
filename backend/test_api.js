const axios = require('axios');
async function runTest() {
  try {
    const loginRes = await axios.post('http://localhost:5005/api/auth/login', {
      username: 'Karthi',
      password: 'admin'
    });
    const token = loginRes.data.token;
    
    const appsRes = await axios.get('http://localhost:5005/api/jobs/my-applications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Applications count:', appsRes.data.length);
    if(appsRes.data.length > 0) {
      const app = appsRes.data[0];
      console.log('Job Title:', app.title);
      console.log('Company:', app.company);
      console.log('Status:', app.status);
      console.log('Match Score:', app.match_score);
      console.log('Applied Date:', app.applied_at);
    }
  } catch (err) {
    console.error('API Error:', err.message);
  } finally {
    process.exit();
  }
}
runTest();
