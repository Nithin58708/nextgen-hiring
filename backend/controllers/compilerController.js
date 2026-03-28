const axios = require('axios');

const LANGUAGE_IDS = {
  javascript: 63, 
  python: 71, 
  java: 62,
  c: 50, 
  cpp: 54, 
  typescript: 74
};

exports.runCode = async (req, res) => {
  const { code, language } = req.body;
  const langId = LANGUAGE_IDS[language?.toLowerCase()] || 63; // Default to JS

  try {
    const response = await axios.post(
      'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true',
      { 
        source_code: code, 
        language_id: langId, 
        cpu_time_limit: 5 
      },
      {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const r = response.data;
    if (r.status?.id === 3) {
      return res.json({
        success: true, 
        output: r.stdout || '(no output)',
        executionTime: r.time, 
        status: 'Accepted'
      });
    } else if (r.status?.id === 6) {
      const line = (r.compile_output || '').match(/:(\d+):/)?.[1];
      return res.json({
        success: false, 
        errorType: 'COMPILATION_ERROR',
        errorMessage: r.compile_output,
        lineNumber: line ? parseInt(line) : null
      });
    } else {
      const line = (r.stderr || '').match(/line (\d+)/)?.[1];
      return res.json({
        success: false, 
        errorType: 'RUNTIME_ERROR',
        errorMessage: r.stderr || r.message,
        lineNumber: line ? parseInt(line) : null
      });
    }
  } catch (error) {
    console.error('Compiler error:', error.message);
    res.status(500).json({ success: false, error: 'Compiler service unavailable' });
  }
};
