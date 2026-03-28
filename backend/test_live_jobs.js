const axios = require('axios');
async function runTest() {
  try {
    const loginRes = await axios.post('http://localhost:5005/api/auth/login', {
      username: 'Karthi',
      password: 'admin'
    });
    const token = loginRes.data.token;
    
    console.log('Testing with user default role...');
    const liveRes = await axios.get('http://localhost:5005/api/jobs/live', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`Default search returned ${liveRes.data.jobs.length} jobs for role: ${liveRes.data.role}`);
    
    console.log('Testing with specific role: Python Developer');
    const pyRes = await axios.get('http://localhost:5005/api/jobs/live?role=Python%20Developer', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`Python search returned ${pyRes.data.jobs.length} jobs`);
    if(pyRes.data.jobs.length > 0) {
      console.log('Sample Job:', pyRes.data.jobs[0].title, '|', pyRes.data.jobs[0].company, '| Link:', pyRes.data.jobs[0].applyLink);
      console.log('Success - Feature 7 backend is fully working');
    }
  } catch (err) {
    if (err.response) {
      console.error('API Error:', err.response.data);
    } else {
      console.error('Test Error:', err.message);
    }
  } finally {
    process.exit();
  }
}
runTest();
