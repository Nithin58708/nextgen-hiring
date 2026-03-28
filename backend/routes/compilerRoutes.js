const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const axios = require('axios');

const LANGS = { javascript:63, python:71, java:62, c:50, cpp:54, typescript:74 };

router.post('/run', auth, async (req,res) => {
  try {
    const { code, language } = req.body;
    const langId = LANGS[language?.toLowerCase()];
    if (!langId)
      return res.status(400).json({
        success:false, error:'Unsupported language: '+language
      });
    const r = await axios.post(
      'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true',
      { source_code:code, language_id:langId, cpu_time_limit:5 },
      {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );
    const d = r.data;
    if (d.status?.id===3)
      return res.json({
        success:true, output:d.stdout||'(no output)', executionTime:d.time
      });
    if (d.status?.id===6) {
      const line = (d.compile_output||'').match(/:(\d+):/)?.[1];
      return res.json({
        success:false, errorType:'COMPILATION_ERROR',
        errorMessage:d.compile_output,
        lineNumber:line?parseInt(line):null
      });
    }
    const line = (d.stderr||'').match(/line (\d+)/)?.[1];
    return res.json({
      success:false, errorType:'RUNTIME_ERROR',
      errorMessage:d.stderr||'Runtime error',
      lineNumber:line?parseInt(line):null
    });
  } catch(err) {
    return res.status(500).json({
      success:false, errorMessage:'Compiler unavailable: '+err.message
    });
  }
});

module.exports = router;
