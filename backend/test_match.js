const axios = require('axios');
async function runTest() {
  try {
    const loginRes = await axios.post('http://localhost:5005/api/auth/login', {
      username: 'Karthi',
      password: 'admin'
    });
    const token = loginRes.data.token;
    
    // Get jobs to find a jobId
    const jobsRes = await axios.get('http://localhost:5005/api/jobs', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if(jobsRes.data.length === 0) {
      console.log('No jobs available');
      process.exit(1);
    }
    const jobId = jobsRes.data[0].id;
    console.log('Testing Match Score for Job ID:', jobId);
    
    const matchRes = await axios.post(`http://localhost:5005/api/match/${jobId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Match API Response:');
    console.log('Score:', matchRes.data.score);
    console.log('Reasoning:', matchRes.data.reasoning);
    console.log('Matched Skills:', matchRes.data.matchedSkills);
    console.log('Missing Skills:', matchRes.data.missingSkills);
    console.log('Recommendation:', matchRes.data.recommendation);
    
  } catch (err) {
    if (err.response) {
      console.error('API Error:', err.response.status, err.response.data);
    } else {
      console.error('Test Error:', err.message);
    }
  } finally {
    process.exit();
  }
}
runTest();
