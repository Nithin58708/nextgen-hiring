require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./db');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173','http://localhost:3000'],
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname,'uploads')));

app.get('/', (req,res) => res.json({ message:'NextGen Hiring API is running' }));

function safeRoute(routePath, filePath) {
  try {
    app.use(routePath, require(filePath));
    console.log('ROUTE OK:', routePath);
  } catch(err) {
    console.error('ROUTE FAIL:', routePath, '-', err.message);
  }
}

safeRoute('/api/auth',        './routes/authRoutes');
safeRoute('/api/resume',      './routes/resumeRoutes');
safeRoute('/api/jobs',        './routes/jobRoutes');
safeRoute('/api/match',       './routes/matchRoutes');
safeRoute('/api/assessments', './routes/assessmentRoutes');
safeRoute('/api/suggestions', './routes/suggestionRoutes');
safeRoute('/api/stats',       './routes/statsRoutes');
safeRoute('/api/admin',       './routes/adminRoutes');
safeRoute('/api/compiler',    './routes/compilerRoutes');

app.use((req,res) =>
  res.status(404).json({ error:'Not found: '+req.method+' '+req.path }));
app.use((err,req,res,next) =>
  res.status(500).json({ error: err.message }));

const PORT = process.env.PORT || 5005;
initDb()
  .then(() => app.listen(PORT, () => {
    console.log('');
    console.log('NextGen Hiring API running on port', PORT);
    console.log('');
  }))
  .catch(err => {
    console.error('Startup failed:', err.message);
    process.exit(1);
  });
