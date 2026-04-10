const { pool } = require('../db');
const { callOpenRouter } = require('../utils/aiHelper');

// POST /api/assessments/generate
exports.generateQuestions = async (req, res) => {
  const userId = req.user.id;

  try {
    const profile = await pool.query(
      'SELECT * FROM job_finder_profiles WHERE user_id=$1', [userId]
    );
    const role = profile.rows[0]?.primary_job_role || 'Software Engineer';
    const skills = profile.rows[0]?.extracted_skills || [];

    const systemPrompt = "You are a technical interview question generator.";
    const userPrompt = `Create a mock technical interview for a ${role} position.
Skills: ${JSON.stringify(skills)}
Return ONLY valid JSON:
{
  "questions": [
    { "id":1, "text":"...", "options":["A","B","C","D"], "answer":"A", "explanation":"..." }
  ]
}
Return 10 MCQs.`;

    const aiCall = callOpenRouter(systemPrompt, userPrompt);
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('OpenRouter timeout 20s')), 20000)
    );

    const data = await Promise.race([aiCall, timeout]);

    const assessmentResult = await pool.query(
      `INSERT INTO assessments (user_id, job_role, questions, status)
       VALUES ($1,$2,$3,'pending') RETURNING id`,
      [userId, role, JSON.stringify(data.questions)]
    );

    res.json({
      success: true,
      id: assessmentResult.rows[0].id,
      assessmentId: assessmentResult.rows[0].id,
      questions: data.questions,
      totalQuestions: data.questions.length
    });
  } catch (error) {
    console.error('generateQuestions error:', error);
    res.status(500).json({ error: 'Failed to generate assessment: ' + error.message });
  }
};

// POST /api/assessments/:id/submit
exports.submitAssessment = async (req, res) => {
  const userId = req.user.id;
  const assessmentId = req.params.id;
  const { answers } = req.body;

  try {
    const assessmentResult = await pool.query(
      'SELECT * FROM assessments WHERE id=$1 AND user_id=$2',
      [assessmentId, userId]
    );
    if (assessmentResult.rows.length === 0) return res.status(404).json({ error: 'Assessment not found' });
    
    const questions = typeof assessmentResult.rows[0].questions === 'string'
      ? JSON.parse(assessmentResult.rows[0].questions)
      : assessmentResult.rows[0].questions;

    // Calculate score
    let correct = 0;
    const wrongCategories = [];
    
    // Answers from frontend is { [idx]: selectedIndex }
    // Questions are index-based in reality but have 'id' fields.
    questions.forEach((q, idx) => {
      const selected = answers[idx]; // answers[currentIdx]
      if (selected !== undefined) {
        if (Number(selected) === q.correctAnswer) correct++;
        else wrongCategories.push(q.category);
      }
    });
    
    const score = Math.round((correct / questions.length) * 100);
    const weakAreas = [...new Set(wrongCategories)];

    // Get AI feedback
    const systemPrompt = "You are a technical interview evaluator.";
    const feedbackPrompt = `
A ${assessmentResult.rows[0].job_role} candidate scored ${score}% 
on a placement test. Wrong categories: ${JSON.stringify(weakAreas)}.

Return ONLY valid JSON:
{
  "overallGrade": "A/B/C/D/F",
  "scoreInterpretation": "2 sentence assessment",
  "strongAreas": [categories they did well in],
  "weakAreas": [categories they struggled with],
  "improvementPlan": [
    { "skill": "name", "action": "what to do", "timelineWeeks": 2 }
  ],
  "interviewTips": [5 specific tips for this role],
  "recommendedCourses": [
    { "skill": "name", "courseName": "name", "platform": "name",
      "link": "real URL", "priority": "High/Medium/Low" }
  ],
  "feedbackSummary": "3-4 sentence paragraph",
  "nextSteps": [3 immediate action items]
}
Return ONLY JSON. No markdown.`;

    const feedback = await callOpenRouter(systemPrompt, feedbackPrompt);

    // Save result
    await pool.query(
      `INSERT INTO assessment_results
         (assessment_id, user_id, answers, score, feedback,
          strong_areas, weak_areas, submitted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())`,
      [assessmentId, userId, JSON.stringify(answers), score,
       JSON.stringify(feedback),
       JSON.stringify(feedback.strongAreas || []),
       JSON.stringify(weakAreas)]
    );

    // Update weak_areas in profile
    await pool.query(
      `UPDATE job_finder_profiles SET weak_areas=$1, last_test_date=NOW()
       WHERE user_id=$2`,
      [JSON.stringify(weakAreas), userId]
    );

    // Invalidate roadmap cache
    await pool.query('DELETE FROM suggestions WHERE user_id=$1', [userId]);

    // Update assessment status
    await pool.query(
      "UPDATE assessments SET status='completed' WHERE id=$1",
      [assessmentId]
    );

    return res.json({ success: true, score, feedback, weakAreas });

  } catch (error) {
    console.error('submitAssessment error:', error);
    res.status(500).json({ error: 'Submission processing failed' });
  }
};

// GET /api/assessments/result/:id
exports.getResult = async (req, res) => {
  const userId = req.user.id;
  const assessmentId = req.params.id;

  try {
    const result = await pool.query(
      'SELECT * FROM assessment_results WHERE assessment_id=$1 AND user_id=$2',
      [assessmentId, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Result not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('getResult error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
