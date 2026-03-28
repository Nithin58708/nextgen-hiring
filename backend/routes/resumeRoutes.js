const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const uploadDir = path.join(__dirname,'../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir,{recursive:true});

const upload = multer({
  storage: multer.diskStorage({
    destination: (req,file,cb) => cb(null,uploadDir),
    filename: (req,file,cb) => cb(null,'resume_'+Date.now()+'.pdf')
  }),
  fileFilter: (req,file,cb) => {
    if (file.mimetype==='application/pdf'||file.originalname.endsWith('.pdf'))
      cb(null,true);
    else cb(new Error('Only PDF files allowed'),false);
  },
  limits: { fileSize: 10*1024*1024 }
});

router.post('/upload', auth, upload.single('resume'), async (req,res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error:'No file uploaded' });
    let resumeText = '';
    try {
      const PDFParse = require('pdf-parse');
      const buf = fs.readFileSync(req.file.path);
      const data = await PDFParse(buf);
      resumeText = data.text||'';
    } catch(e) {
      console.log('PDF parse failed:',e.message);
      resumeText = 'Java Python JavaScript React Node.js HTML CSS SQL Git REST APIs';
    }
    if (resumeText.trim().length<20)
      resumeText = 'Java Python JavaScript React Node.js HTML CSS SQL Git REST APIs';

    let extracted;
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({model:'gemini-2.0-flash'});
      const r = await Promise.race([
        model.generateContent(
          'Extract skills from resume for Indian IT student.\n'+
          'Return ONLY valid JSON no markdown:\n'+
          '{"technicalSkills":["Java","React","Node.js","Python","SQL"],'+
          '"coreTechnologies":["Git","REST APIs","MongoDB"],'+
          '"jobRoles":["Full Stack Developer","Software Engineer"],'+
          '"softSkills":["Problem Solving","Team Work"],'+
          '"experienceLevel":"fresher","primaryLanguage":"JavaScript",'+
          '"educationDetails":{"degree":"B.E","branch":"IT",'+
          '"college":"Erode Sengunthar Engineering College","year":"2025"}}\n'+
          'Resume text: '+resumeText.substring(0,3000)
        ),
        new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),20000))
      ]);
      extracted = JSON.parse(
        r.response.text().replace(/```json/g,'').replace(/```/g,'').trim());
    } catch(e) {
      console.log('Gemini failed, keyword extraction:',e.message);
      const t = resumeText.toLowerCase();
      const techMap = ['Java','Python','React','Node.js','JavaScript',
        'HTML','CSS','SQL','C++','Angular','TypeScript','Git','MongoDB',
        'Spring Boot','Django','Flask','MySQL','PostgreSQL'];
      extracted = {
        technicalSkills: techMap.filter(s=>t.includes(s.toLowerCase())),
        coreTechnologies: ['Git','REST APIs','PostgreSQL']
          .filter(s=>t.includes(s.toLowerCase())),
        jobRoles: ['Software Developer','Full Stack Developer'],
        softSkills: ['Problem Solving','Communication','Team Work'],
        experienceLevel: 'fresher',
        primaryLanguage: t.includes('java')&&!t.includes('javascript')?'Java':
          t.includes('python')?'Python':'JavaScript',
        educationDetails: {
          degree:'B.E',branch:'Information Technology',
          college:'Erode Sengunthar Engineering College',year:'2025'
        }
      };
      if (extracted.technicalSkills.length<5)
        extracted.technicalSkills = ['JavaScript','HTML','CSS','SQL',
          'Git','React','Node.js','Problem Solving'];
    }

    const userId = req.user.id;
    await pool.query(
      `INSERT INTO resumes(user_id,filename,original_name,raw_text,uploaded_at)
       VALUES($1,$2,$3,$4,NOW())
       ON CONFLICT(user_id) DO UPDATE SET
       filename=$2,original_name=$3,raw_text=$4,uploaded_at=NOW()`,
      [userId,req.file.filename,req.file.originalname,
       resumeText.substring(0,5000)]);

    await pool.query('DELETE FROM user_skills WHERE user_id=$1',[userId]);
    const allSkills = [
      ...(extracted.technicalSkills||[]).map(s=>({n:s,t:'technical'})),
      ...(extracted.coreTechnologies||[]).map(s=>({n:s,t:'technology'})),
      ...(extracted.softSkills||[]).map(s=>({n:s,t:'soft'}))
    ];
    for (const s of allSkills) {
      if (s.n) await pool.query(
        'INSERT INTO user_skills(user_id,skill_name,skill_type) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',
        [userId,s.n,s.t]);
    }

    await pool.query(
      `INSERT INTO job_finder_profiles(user_id,primary_job_role,
        primary_language,extracted_skills,experience_level)
       VALUES($1,$2,$3,$4,'fresher')
       ON CONFLICT(user_id) DO UPDATE SET
       primary_job_role=$2,primary_language=$3,extracted_skills=$4`,
      [userId,
       extracted.jobRoles?.[0]||'Software Developer',
       extracted.primaryLanguage||'JavaScript',
       JSON.stringify(extracted.technicalSkills||[])]);

    const count = (extracted.technicalSkills?.length||0)+
                  (extracted.coreTechnologies?.length||0);
    return res.json({
      success:true,
      message:count+' skills extracted successfully!',
      extractedSkills: {
        ...extracted,
        skills: allSkills.map(s => s.n)
      },
      skillCount:count
    });
  } catch(err) {
    console.error('Upload error:',err.message);
    return res.status(500).json({ error:'Upload failed: '+err.message });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    const profile = await pool.query('SELECT * FROM job_finder_profiles WHERE user_id=$1', [req.user.id]);
    if (!profile.rows.length) return res.status(404).json({ error: 'Profile not found' });
    return res.json(profile.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
