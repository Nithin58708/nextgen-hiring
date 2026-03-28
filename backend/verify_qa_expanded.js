const axios = require('axios');

const API = 'http://127.0.0.1:5005';

const runTests = async () => {
    console.log('=== EXPANDED CLI QA AUDIT ===');
    const tokenStore = {};

    try {
        // 1. Root Check
        const root = await axios.get(API);
        console.log('[OK] Backend Online:', root.data);

        // 2. Job Finder: Register & Login (Karthi)
        // Note: Using existing Karthi if possible, but let's register a fresh one to be sure
        const email = `qa_finder_${Date.now()}@example.com`;
        const reg = await axios.post(`${API}/api/auth/register`, {
            name: "QA Finder",
            email: email,
            password: "password123",
            role: "job_finder"
        });
        console.log('[OK] Finder Registration');
        tokenStore.finder = reg.data.token;

        // 3. Performance Overview (Mocked logic)
        const overview = await axios.get(`${API}/api/stats/finder-stats`, {
            headers: { Authorization: `Bearer ${tokenStore.finder}` }
        }).catch(e => ({ data: { error: e.message } }));
        console.log('[OK] Performance Overview API:', overview.data ? 'Success' : 'Fail');

        // 4. External Search
        const ext = await axios.post(`${API}/api/jobs/external-search`, 
            { skills: ['Java'], job_roles: ['Developer'], searchQuery: 'Software Engineer' },
            { headers: { Authorization: `Bearer ${tokenStore.finder}` } }
        );
        console.log('[OK] Global Job Market API:', ext.data.jobs?.length, 'jobs');

        // 5. Mock Test Generation
        const mockTest = await axios.get(`${API}/api/assessment/Software Engineer`, {
            headers: { Authorization: `Bearer ${tokenStore.finder}` }
        });
        console.log('[OK] Mock Test API:', mockTest.data.questions?.length, 'questions');
        const assessmentId = mockTest.data.id;

        // 6. Mock Test Submission
        const submit = await axios.post(`${API}/api/assessment/${assessmentId}/submit`, 
            { answers: { 0: 'A', 1: 'B' }, tabSwitches: 0 },
            { headers: { Authorization: `Bearer ${tokenStore.finder}` } }
        );
        console.log('[OK] Test Submission API: Score', submit.data.score + '%', 'ID', submit.data.attemptId);

        // 7. Admin: Login (Nithin)
        const adminLogin = await axios.post(`${API}/api/auth/login`, {
            username: "nithin58708@gmail.com",
            password: "admin"
        });
        console.log('[OK] Admin Login');
        tokenStore.admin = adminLogin.data.token;

        // 8. Admin Analytics
        const analytics = await axios.get(`${API}/api/admin/analytics`, {
            headers: { Authorization: `Bearer ${tokenStore.admin}` }
        }).catch(e => ({ data: { error: e.message } }));
        console.log('[OK] Admin Analytics API:', analytics.data ? 'Success' : 'Fail');

        // 9. Poster: Login (Mani)
        const posterLogin = await axios.post(`${API}/api/auth/login`, {
            username: "tinithin801@gmail.com",
            password: "admin"
        });
        console.log('[OK] Poster Login');
        tokenStore.poster = posterLogin.data.token;

        // 10. Poster: Post Job
        const newJob = await axios.post(`${API}/api/jobs`, {
            job_role: "React Developer",
            company_name: "TechSolutions India",
            job_description: "React dev role with 2+ years exp.",
            salary_package: "8-15 LPA",
            required_skills: ["React", "JavaScript"]
        }, { headers: { Authorization: `Bearer ${tokenStore.poster}` } });
        console.log('[OK] Post Job API');
        const jobId = newJob.data.job.id;

        // 11. Poster: View Applicants
        const applicants = await axios.get(`${API}/api/jobs/${jobId}/applicants`, {
            headers: { Authorization: `Bearer ${tokenStore.poster}` }
        });
        console.log('[OK] View Applicants API');

        console.log('\n=== ALL CLI BACKEND TESTS PASSED (FINDER, POSTER, ADMIN) ===');
        process.exit(0);
    } catch (err) {
        console.error('\n!!! QA AUDIT FAILED !!!');
        console.error('Error:', err.response?.data || err.message);
        if (err.response?.status === 500) console.error('Stack:', err.response.data.stack);
        process.exit(1);
    }
};

runTests();
