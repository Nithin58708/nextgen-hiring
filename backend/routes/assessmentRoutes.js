const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../db');
const { callOpenRouter } = require('../utils/aiHelper');

router.post('/generate', auth, async (req,res) => {
  try {
    const userId = req.user.id;
    const jobRole = req.body.jobRole||'Software Engineer';
    const jobDesc = req.body.jobDescription||'Software development role';

    const profileRes = await pool.query(
      `SELECT jfp.*,array_agg(us.skill_name) as skills
       FROM job_finder_profiles jfp
       LEFT JOIN user_skills us ON us.user_id=jfp.user_id
       WHERE jfp.user_id=$1 GROUP BY jfp.id`,[userId]);
    const profile = profileRes.rows[0]||{};
    const userSkills = (profile.skills||[]).filter(Boolean);
    const lang = profile.primary_language||'JavaScript';

    const CODING = ['developer','engineer','software','react','angular',
      'java','python','node','full stack','backend','frontend','data','devops'];
    const needsCoding = CODING.some(r=>jobRole.toLowerCase().includes(r));

    const prompt = `Senior technical interviewer at top Indian IT company.
Candidate: role=${jobRole}, language=${lang}
Skills: ${JSON.stringify(userSkills).substring(0,300)}
Job: ${jobDesc.substring(0,200)}
Uniqueness seed: ${Date.now()}

Generate EXACTLY 20 unique interview questions.
NEVER write "Option A/B/C/D" or "Interview Question #N".
All options must be real specific answers.

Q1-5 APTITUDE (same for all roles):
  Q1: Number series with real numbers (e.g. 2,6,12,20,?)
  Q2: Time/work or percentage problem with actual numbers
  Q3: Blood relations or logical reasoning puzzle
  Q4: Profit/loss or ratio with actual numbers
  Q5: Sentence correction or vocabulary

Q6-10 OOP using ${lang}:
  Each must have real ${lang} code snippet showing concept
  Cover: class/object, inheritance, polymorphism, encapsulation, exceptions

Q11-15 SQL:
  Real SQL queries with actual table names and columns
  Cover: JOINs, GROUP BY/HAVING, subqueries, indexes, transactions

Q16-18 TECHNICAL specific to ${jobRole}:
  MUST reference actual tools/frameworks from this role
  Each must have real code snippet

${needsCoding ? `Q19-20 CODING CHALLENGE in ${lang}:
  Real programming problems with starter code template
  e.g. palindrome check, fibonacci, find duplicates, sort algorithm` :
`Q19-20 SCENARIO for ${jobRole}:
  System design or architecture questions`}

Return EXACTLY a JSON array of 20 objects:
[{
  "id": 1,
  "section": "APTITUDE",
  "category": "Logical Reasoning",
  "difficulty": "medium",
  "question": "real specific question text here",
  "options": ["real answer 1","real answer 2","real answer 3","real answer 4"],
  "correctAnswer": 0,
  "explanation": "why this answer is correct",
  "hasCode": false,
  "codeSnippet": null,
  "isCompilable": false,
  "starterCode": null,
  "expectedOutput": null
}]

Return ONLY the JSON array. No markdown. No backticks. No explanation.`;

    let result;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        result = await callOpenRouter("Return ONLY a JSON array.", prompt);
        break;
      } catch (retryErr) {
        console.log(`Gemini attempt ${attempt+1} failed:`, retryErr.message);
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 5000));
        } else {
          console.log('Using fallback questions due to Gemini failure');
          const fallbackQ = [];
          for(let i=1; i<=20; i++) {
            fallbackQ.push({
              id: i,
              section: i<=5 ? "APTITUDE" : i<=10 ? "OOP" : i<=15 ? "SQL" : "TECHNICAL",
              category: "General",
              difficulty: "medium",
              question: "Sample Question " + i + " for " + jobRole + "?",
              options: ["Option 1", "Option 2", "Option 3", "Option 4"],
              correctAnswer: 0,
              explanation: "Fallback correct answer explanation",
              hasCode: false,
              codeSnippet: null,
              isCompilable: false,
              starterCode: null,
              expectedOutput: null
            });
          }
          let questions = fallbackQ;
          const saved = await pool.query(
            `INSERT INTO assessments(user_id,job_role,questions,status,created_at)
             VALUES($1,$2,$3,'pending',NOW()) RETURNING id`,
            [userId,jobRole,JSON.stringify(questions)]);
          return res.json({
            success:true,
            id:saved.rows[0].id,
            questions,
            jobRole,
            totalQuestions:questions.length
          });
        }
      }
    }

    let questions;
    try {
      questions = typeof result === 'string' ? JSON.parse(result.replace(/```json/g,'').replace(/```/g,'').trim()) : result;
    } catch(parseErr) {
      console.log('Failed to parse Gemini output, using fallback');
      const fallbackQ = [];
      for(let i=1; i<=20; i++) {
        fallbackQ.push({
          id: i, section: "APTITUDE", category: "Fallback", difficulty: "easy",
          question: "Fallback Q" + i, options: ["A","B","C","D"], correctAnswer: 0,
          explanation: "Fallback", hasCode: false, codeSnippet: null,
          isCompilable: false, starterCode: null, expectedOutput: null
        });
      }
      questions = fallbackQ;
    }

    questions = questions.filter(q =>
      q.question &&
      !q.question.includes('Interview Question #') &&
      q.options?.length===4
    );

    if (questions.length<15) {
      console.log('Too few valid questions parsed, padding with fallbacks');
      for(let i=questions.length+1; i<=20; i++) {
        questions.push({
          id: i, section: "APTITUDE", category: "Fallback", difficulty: "easy",
          question: "Fallback Padded Q" + i, options: ["A","B","C","D"], correctAnswer: 0,
          explanation: "Fallback", hasCode: false, codeSnippet: null,
          isCompilable: false, starterCode: null, expectedOutput: null
        });
      }
    }

    const saved = await pool.query(
      `INSERT INTO assessments(user_id,job_role,questions,status,created_at)
       VALUES($1,$2,$3,'pending',NOW()) RETURNING id`,
      [userId,jobRole,JSON.stringify(questions)]);

    return res.json({
      success:true,
      id:saved.rows[0].id,
      questions,
      jobRole,
      totalQuestions:questions.length
    });
  } catch(err) {
    console.error('Generate questions error:',err.message);
    return res.status(500).json({ error:'Question generation failed: '+err.message });
  }
});

router.post('/:id/submit', auth, async (req,res) => {
  try {
    const { answers } = req.body;
    const assessRes = await pool.query(
      'SELECT * FROM assessments WHERE id=$1 AND user_id=$2',
      [req.params.id,req.user.id]);
    if (!assessRes.rows.length)
      return res.status(404).json({ error:'Assessment not found' });

    const questions = assessRes.rows[0].questions;
    let correct = 0;
    const wrongCats = [];
    (answers||[]).forEach(a => {
      const q = questions.find(q=>q.id===a.questionId);
      if (q) {
        if (a.selectedAnswer===q.correctAnswer) correct++;
        else wrongCats.push(q.category);
      }
    });
    const score = Math.round((correct/Math.max(questions.length,1))*100);
    const weakAreas = [...new Set(wrongCats)];

    let feedback = {
      overallGrade: score>=90?'A':score>=75?'B':score>=60?'C':score>=50?'D':'F',
      scoreInterpretation: 'You scored '+score+'% on this assessment.',
      strongAreas: [],
      weakAreas,
      improvementPlan: weakAreas.map(w=>({
        skill:w,action:'Review '+w+' fundamentals',timelineWeeks:2
      })),
      interviewTips: [
        'Practice coding problems daily on LeetCode',
        'Review OOP concepts and design patterns',
        'Study SQL query optimization',
        'Build projects to strengthen weak areas',
        'Practice mock interviews with peers'
      ],
      recommendedCourses: [
        {skill:'Problem Solving',courseName:'Data Structures & Algorithms',
         platform:'Udemy',link:'https://udemy.com',priority:'High'}
      ],
      feedbackSummary: 'You scored '+score+'%. Focus on weak areas to improve placement readiness.',
      nextSteps: ['Review all wrong answers','Practice weak topics for 2 weeks','Retake the test']
    };

    try {
      let r;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const userPrompt = 'Student scored '+score+'% on '+assessRes.rows[0].job_role+' test.\n'+
              'Wrong categories: '+JSON.stringify(weakAreas);
          const systemPrompt = 'Return ONLY valid JSON no markdown:\n'+
              '{"overallGrade":"'+feedback.overallGrade+'",'+
              '"scoreInterpretation":"2 sentence assessment of performance",'+
              '"strongAreas":["categories they did well in"],'+
              '"weakAreas":'+JSON.stringify(weakAreas)+','+
              '"improvementPlan":[{"skill":"name","action":"specific action","timelineWeeks":2}],'+
              '"interviewTips":["tip1","tip2","tip3","tip4","tip5"],'+
              '"recommendedCourses":[{"skill":"name","courseName":"name","platform":"Udemy","link":"https://udemy.com","priority":"High"}],'+
              '"feedbackSummary":"3-4 sentence overall feedback",'+
              '"nextSteps":["step1","step2","step3"]}';
              
          r = await callOpenRouter(systemPrompt, userPrompt);
          break;
        } catch (retryErr) {
          console.log(`Gemini feedback attempt ${attempt+1} failed:`, retryErr.message);
          if (attempt < 2) {
            await new Promise(r => setTimeout(r, (attempt + 1) * 3000));
          } else {
            throw retryErr;
          }
        }
      }

      feedback = typeof r === 'string' ? JSON.parse(r.replace(/```json/g,'').replace(/```/g,'').trim()) : r;
    } catch(e) { console.log('Feedback AI skip:',e.message); }

    const resultRow = await pool.query(
      `INSERT INTO assessment_results(assessment_id,user_id,answers,
        score,feedback,strong_areas,weak_areas,submitted_at)
       VALUES($1,$2,$3,$4,$5,$6,$7,NOW()) RETURNING id`,
      [req.params.id,req.user.id,JSON.stringify(answers),score,
       JSON.stringify(feedback),
       JSON.stringify(feedback.strongAreas||[]),
       JSON.stringify(weakAreas)]);
    const resultId = resultRow.rows[0].id;

    await pool.query(
      "UPDATE assessments SET status='completed' WHERE id=$1",[req.params.id]);
    await pool.query(
      'UPDATE job_finder_profiles SET weak_areas=$1,last_test_date=NOW() WHERE user_id=$2',
      [JSON.stringify(weakAreas),req.user.id]);
    await pool.query(
      'DELETE FROM suggestions WHERE user_id=$1',[req.user.id]);

    return res.json({ success:true, score, feedback, weakAreas, resultId, id: resultId });
  } catch(err) {
    return res.status(500).json({ error:err.message });
  }
});

router.get('/result/:id', auth, async (req,res) => {
  try {
    const r = await pool.query(
      `SELECT ar.*,a.job_role FROM assessment_results ar
       JOIN assessments a ON ar.assessment_id=a.id
       WHERE ar.id=$1 AND ar.user_id=$2`,
      [req.params.id,req.user.id]);
    if (!r.rows.length)
      return res.status(404).json({ error:'Result not found' });
    return res.json({ success:true, result:r.rows[0] });
  } catch(err) { return res.status(500).json({ error:err.message }); }
});

module.exports = router;
