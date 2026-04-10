const { pool } = require('../db');
const PDFParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const { callOpenRouter, offlineKeywordExtraction } = require('../utils/aiHelper');
const { cleanResumeText } = require('../utils/textCleaner');

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({error:'No file uploaded'});

    console.log('Resume upload:', req.file.originalname,
      req.file.size, 'bytes');

    // Try to extract PDF text
    let resumeText = '';
    try {
      const PDFParse = require('pdf-parse');
      const buffer = fs.readFileSync(req.file.path);
      // Determine what was actually exported
      const parseFunc = typeof PDFParse === 'function' ? PDFParse : (PDFParse.PDFParse || PDFParse.default);
      
      if (!parseFunc || typeof parseFunc !== 'function') {
        throw new Error('Module pdf-parse is malformed or invalid version.');
      }
      
      const data = await parseFunc(buffer);
      resumeText = data.text || '';
    } catch(pdfErr) {
      console.log('PDF parse error gracefully handled:', pdfErr.message);
      // We explicitly leave resumeText empty so AI fallback will kick in 
      // instead of hardcoding static arrays.
      resumeText = ''; 
    }

    // If no text extracted, use filename as hint
    if (!resumeText || resumeText.trim().length < 20) {
      console.log('No PDF text extracted, using filename hint only');
      resumeText = req.file.originalname;
    }

    // Call AI for skill extraction
    let extractedData;
    try {
      const systemPrompt = `Extract professional skills, technologies, and education from this resume text.
Return ONLY valid JSON with the following structure:
{
  "technicalSkills": [],
  "coreTechnologies": [],
  "jobRoles": [],
  "softSkills": [],
  "experienceLevel": "fresher" | "junior" | "mid" | "senior",
  "primaryLanguage": "",
  "educationDetails": {"degree":"", "branch":"", "college":"", "year":""}
}
Return ONLY the JSON object, NO markdown.`;

      const cleanedResume = cleanResumeText(resumeText);
      const userPrompt = `Resume text: ${cleanedResume.substring(0, 4000)}`;

      extractedData = await callOpenRouter(systemPrompt, userPrompt);
    } catch(aiErr) {
      console.warn('AI Parsing Quota/Network Error:', aiErr.message, '- Using Offline Keyword Extractor instead');
      // Power robust offline keyword extractor algorithm
      extractedData = offlineKeywordExtraction(resumeText);
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
       extractedData.jobRoles?.[0] || null,
       extractedData.primaryLanguage || null,
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
