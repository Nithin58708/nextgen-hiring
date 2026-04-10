const { callOpenRouter } = require('../utils/aiHelper');
exports.searchExternalJobs = async (req, res) => {
  try {
    const { skills = [], job_roles = [], searchQuery = 'Software Developer' } = req.body;
    console.log('External search request:', { skills, job_roles, searchQuery });
    
    const systemPrompt = "You are a job search assistant for India.";
    const userPrompt = `Generate 6 realistic job opportunities for a candidate with these skills.
Skills: ${skills.slice(0,10).join(', ')}
Job Roles: ${job_roles.join(', ')}
Search: ${searchQuery}

Return ONLY a JSON object containing a "jobs" array. No markdown. No backticks:
{
  "jobs": [
    {
      "title": "Full Stack Developer",
      "company": "TCS",
      "location": "Chennai, Tamil Nadu",
      "description": "Looking for developer with Java and web skills",
      "required_skills": ["Java","HTML","CSS","SQL"],
      "salary": "6-10 LPA",
      "experience": "0-2 years",
      "apply_link": "https://www.tcs.com/careers",
      "source": "TCS Careers"
    }
  ]
}
Generate jobs specifically relevant to the candidate's skills above. Return exactly 6 items.`;

    const result = await callOpenRouter(systemPrompt, userPrompt);
    const jobs = Array.isArray(result) ? result : (result.jobs || []);
    console.log('External jobs generated:', jobs.length);
    res.json({ success: true, jobs });
    
  } catch (err) {
    console.error('External search FAILED:', err.message);
    // Return fallback jobs if AI fails
    res.json({ 
      success: true, 
      jobs: [
        { title: 'Full Stack Developer', company: 'TCS', location: 'Chennai', description: 'Web development role', required_skills: ['Java','HTML','CSS'], salary: '6-10 LPA', experience: '0-2 years', apply_link: 'https://www.tcs.com/careers', source: 'TCS Careers' },
        { title: 'Software Developer', company: 'Infosys', location: 'Bangalore', description: 'Software development', required_skills: ['JavaScript','SQL'], salary: '4-7 LPA', experience: 'Fresher', apply_link: 'https://www.infosys.com/careers', source: 'Infosys Careers' },
        { title: 'ASP.NET Developer', company: 'Wipro', location: 'Hyderabad', description: 'ASP.NET development', required_skills: ['ASP.NET MVC','C#','SQL'], salary: '5-9 LPA', experience: '0-2 years', apply_link: 'https://careers.wipro.com', source: 'Wipro Careers' },
        { title: 'Junior Developer', company: 'HCL', location: 'Chennai', description: 'Web development', required_skills: ['HTML','CSS','JavaScript'], salary: '4-6 LPA', experience: 'Fresher', apply_link: 'https://www.hcltech.com/careers', source: 'HCL Careers' },
        { title: 'Database Developer', company: 'Cognizant', location: 'Coimbatore', description: 'Database development', required_skills: ['SQL','PostgreSQL'], salary: '5-8 LPA', experience: '0-2 years', apply_link: 'https://careers.cognizant.com', source: 'Cognizant Careers' },
        { title: 'Software Trainee', company: 'Tech Mahindra', location: 'Chennai', description: 'Trainee program', required_skills: ['Java','OOP','SQL'], salary: '3-5 LPA', experience: 'Fresher', apply_link: 'https://careers.techmahindra.com', source: 'Tech Mahindra Careers' }
      ]
    });
  }
};
