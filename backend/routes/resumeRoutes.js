const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');
const { callOpenRouter } = require('../utils/aiHelper');
const { cleanResumeText } = require('../utils/textCleaner');

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

const { uploadResume, getProfile } = require('../controllers/resumeController');

router.post('/upload', auth, upload.single('resume'), uploadResume);
router.get('/profile', auth, getProfile);

module.exports = router;
