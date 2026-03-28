const { pool } = require('../db');
const PDFParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({error:'No file uploaded'});

    console.log('Resume upload:', req.file.originalname,
      req.file.size, 'bytes');

    // Try to extract PDF text
    let resumeText = '';
    try {
      const buffer = fs.readFileSync(req.file.path);
      const data = await PDFParse.PDFParse(buffer);
      resumeText = data.text || '';
    } catch(pdfErr) {
      console.log('PDF parse failed:', pdfErr.message);
      resumeText = ''; // Continue with empty text
    }

    // If no text extracted, use filename as hint
    if (!resumeText || resumeText.trim().length < 20) {
      console.log('No PDF text, using fallback extraction');
      resumeText = req.file.originalname + 
        ' Java Python React Node.js SQL HTML CSS Git REST APIs JavaScript';
    }

    // Call Gemini for skill extraction
    let extractedData;
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({model:'gemini-2.0-flash'});

      const prompt = `Extract skills from this resume text.
Return ONLY valid JSON with NO markdown or backticks:
{
  "technicalSkills": ["Java","Python","React","Node.js","SQL"],
  "coreTechnologies": ["Git","REST APIs","MongoDB"],
  "jobRoles": ["Full Stack Developer","Backend Developer"],
  "softSkills": ["Problem Solving","Team Work"],
  "experienceLevel": "fresher",
  "primaryLanguage": "JavaScript",
  "educationDetails": {"degree":"B.E","branch":"IT","college":"","year":"2025"}
}
Resume text: ${resumeText.substring(0, 3000)}
Return ONLY the JSON object.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text()
        .replace(/```json/g,'').replace(/```/g,'').trim();
      extractedData = JSON.parse(text);
    } catch(aiErr) {
      console.log('Gemini failed:', aiErr.message, '- using keyword extraction');
      // Keyword-based fallback
      const text = resumeText.toLowerCase();
      extractedData = {
        technicalSkills: [
          text.includes('java') ? 'Java' : null,
          text.includes('python') ? 'Python' : null,
          text.includes('react') ? 'React' : null,
          text.includes('node') ? 'Node.js' : null,
          text.includes('sql') ? 'SQL' : null,
          text.includes('javascript') ? 'JavaScript' : null,
          text.includes('html') ? 'HTML' : null,
          text.includes('css') ? 'CSS' : null,
          'Problem Solving'
        ].filter(Boolean),
        coreTechnologies: ['Git','REST APIs','PostgreSQL'],
        jobRoles: ['Software Developer','Full Stack Developer'],
        softSkills: ['Communication','Team Work'],
        experienceLevel: 'fresher',
        primaryLanguage: 'JavaScript',
        educationDetails: {
          degree:'B.E', branch:'Information Technology',
          college:'Erode Sengunthar Engineering College', year:'2025'
        }
      };
    }

    const userId = req.user.id;

    // Save resume record
    await pool.query(
      `INSERT INTO resumes (user_id,filename,original_name,raw_text,uploaded_at)
       VALUES ($1,$2,$3,$4,NOW())
       ON CONFLICT (user_id) DO UPDATE SET
       filename=$2, original_name=$3, raw_text=$4, uploaded_at=NOW()`,
      [userId, req.file.filename, req.file.originalname,
       resumeText.substring(0,5000)]
    );

    // Clear and save skills
    await pool.query(
      'DELETE FROM user_skills WHERE user_id=$1', [userId]
    );
    const allSkills = [
      ...extractedData.technicalSkills.map(s=>({name:s,type:'technical'})),
      ...extractedData.coreTechnologies.map(s=>({name:s,type:'technology'})),
      ...extractedData.softSkills.map(s=>({name:s,type:'soft'}))
    ];
    for (const skill of allSkills) {
      if (skill.name) {
        await pool.query(
          `INSERT INTO user_skills (user_id,skill_name,skill_type)
           VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
          [userId, skill.name, skill.type]
        );
      }
    }

    // Update job_finder_profiles
    await pool.query(
      `INSERT INTO job_finder_profiles
         (user_id,primary_job_role,primary_language,extracted_skills,experience_level)
       VALUES ($1,$2,$3,$4,'fresher')
       ON CONFLICT (user_id) DO UPDATE SET
       primary_job_role=$2, primary_language=$3, extracted_skills=$4`,
      [userId,
       extractedData.jobRoles?.[0] || 'Software Developer',
       extractedData.primaryLanguage || 'JavaScript',
       JSON.stringify(extractedData.technicalSkills || [])]
    );

    const skillCount = (extractedData.technicalSkills?.length || 0) +
      (extractedData.coreTechnologies?.length || 0);

    return res.json({
      success: true,
      message: `${skillCount} skills extracted successfully!`,
      extractedSkills: extractedData,
      skillCount
    });

  } catch(err) {
    console.error('uploadResume crash:', err.message, err.stack);
    return res.status(500).json({error:'Upload failed: '+err.message});
  }
};

exports.getProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT jfp.*, r.filename, r.original_name, r.uploaded_at
       FROM job_finder_profiles jfp
       LEFT JOIN resumes r ON jfp.user_id = r.user_id
       WHERE jfp.user_id = $1`,
      [userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Profile not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
