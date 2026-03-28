require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function reinit() {
  console.log('--- Wiping and Re-initializing DB ---');
  
  const tablesToDrop = [
    'resumes', 'user_skills', 'job_finder_profiles', 'jobs', 
    'job_applications', 'job_matches', 'assessments', 
    'assessment_results', 'suggestions', 'assessment_attempts', 
    'job_poster_profiles', 'admin_notifications', 'resume_suggestions'
  ];
  
  for (const t of tablesToDrop) {
    try {
      await pool.query(`DROP TABLE IF EXISTS ${t} CASCADE`);
      console.log(`[DROPPED] ${t}`);
    } catch (err) {
      console.log(`[SKIP] ${t}: ${err.message}`);
    }
  }
  
  console.log('\n--- Running initDb from db.js logic ---');
  
  // Logic from db.js
  await pool.query(`
    CREATE TABLE resumes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) UNIQUE,
      filename VARCHAR(255),
      original_name VARCHAR(255),
      raw_text TEXT,
      uploaded_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE user_skills (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      skill_name VARCHAR(100),
      skill_type VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE job_finder_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) UNIQUE,
      primary_job_role VARCHAR(200),
      primary_language VARCHAR(100) DEFAULT 'JavaScript',
      extracted_skills JSONB DEFAULT '[]',
      experience_level VARCHAR(50) DEFAULT 'fresher',
      weak_areas JSONB DEFAULT '[]',
      last_test_date TIMESTAMP
    );

    CREATE TABLE jobs (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      company VARCHAR(200) NOT NULL,
      description TEXT,
      salary VARCHAR(100),
      location VARCHAR(200),
      required_skills JSONB DEFAULT '[]',
      status VARCHAR(20) DEFAULT 'pending',
      posted_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE job_applications (
      id SERIAL PRIMARY KEY,
      job_id INTEGER REFERENCES jobs(id),
      user_id INTEGER REFERENCES users(id),
      cover_letter TEXT,
      status VARCHAR(20) DEFAULT 'applied',
      applied_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(job_id, user_id)
    );

    CREATE TABLE job_matches (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      job_id INTEGER REFERENCES jobs(id),
      score INTEGER,
      reasoning TEXT,
      matched_skills JSONB DEFAULT '[]',
      missing_skills JSONB DEFAULT '[]',
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, job_id)
    );

    CREATE TABLE assessments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      job_id INTEGER,
      job_role VARCHAR(200),
      questions JSONB DEFAULT '[]',
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE assessment_results (
      id SERIAL PRIMARY KEY,
      assessment_id INTEGER REFERENCES assessments(id),
      user_id INTEGER REFERENCES users(id),
      answers JSONB DEFAULT '[]',
      score INTEGER,
      feedback JSONB DEFAULT '{}',
      strong_areas JSONB DEFAULT '[]',
      weak_areas JSONB DEFAULT '[]',
      submitted_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE suggestions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      job_id INTEGER,
      roadmap JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  
  console.log('--- RE-INIT COMPLETE ---');
  await pool.end();
}

reinit().catch(err => {
  console.error(err);
  pool.end();
});
