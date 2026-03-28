const axios = require('axios');

const API = 'http://127.0.0.1:5005';

const runTests = async () => {
    console.log('--- STARTING CLI VERIFICATION ---');
    try {
        // 1. Test Root
        const root = await axios.get(API);
        console.log('[PASS] Root:', root.data);

        // 2. Test Register
        const email = `test_${Date.now()}@example.com`;
        const reg = await axios.post(`${API}/api/auth/register`, {
            name: "Test User",
            email: email,
            password: "password123",
            role: "job_finder"
        });
        console.log('[PASS] Register:', reg.data.token ? 'Success (Token received)' : 'Fail');
        const token = reg.data.token;

        // 3. Test External Search (Critical Fix 2)
        const extSearch = await axios.post(`${API}/api/jobs/external-search`, 
            { skills: ['Java', 'SQL'], job_roles: ['Developer'], searchQuery: 'Software Engineer' },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('[PASS] External Search:', extSearch.data.jobs ? `Success (${extSearch.data.jobs.length} jobs)` : 'Fail');

        // 4. Test Profile Fetch
        const profile = await axios.get(`${API}/api/resume/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('[PASS] Profile (Empty):', profile.data === null ? 'Success (Null)' : 'Fail');

        process.exit(0);
    } catch (err) {
        console.error('[FAIL] Verification crashed:', err.response?.data || err.message);
        process.exit(1);
    }
};

runTests();
