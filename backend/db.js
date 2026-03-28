require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function initDb() {
  await pool.query('SELECT 1');
  console.log('PostgreSQL connected');
  await runMigrations();
  await ensureUsers();
  await seedJobs();
}

async function runMigrations() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      email VARCHAR(200) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'job_finder',
      created_at TIMESTAMP DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS resumes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) UNIQUE,
      filename VARCHAR(255),
      original_name VARCHAR(255),
      raw_text TEXT,
      uploaded_at TIMESTAMP DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS user_skills (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      skill_name VARCHAR(100),
      skill_type VARCHAR(50) DEFAULT 'technical',
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, skill_name)
    )`,
    `CREATE TABLE IF NOT EXISTS job_finder_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) UNIQUE,
      primary_job_role VARCHAR(200) DEFAULT 'Software Engineer',
      primary_language VARCHAR(100) DEFAULT 'JavaScript',
      extracted_skills JSONB DEFAULT '[]',
      experience_level VARCHAR(50) DEFAULT 'fresher',
      weak_areas JSONB DEFAULT '[]',
      last_test_date TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS jobs (
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
    )`,
    `CREATE TABLE IF NOT EXISTS job_applications (
      id SERIAL PRIMARY KEY,
      job_id INTEGER REFERENCES jobs(id),
      user_id INTEGER REFERENCES users(id),
      cover_letter TEXT,
      status VARCHAR(20) DEFAULT 'applied',
      applied_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(job_id, user_id)
    )`,
    `CREATE TABLE IF NOT EXISTS job_matches (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      job_id INTEGER REFERENCES jobs(id),
      score INTEGER DEFAULT 0,
      reasoning TEXT,
      matched_skills JSONB DEFAULT '[]',
      missing_skills JSONB DEFAULT '[]',
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, job_id)
    )`,
    `CREATE TABLE IF NOT EXISTS assessments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      job_id INTEGER,
      job_role VARCHAR(200),
      questions JSONB DEFAULT '[]',
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS assessment_results (
      id SERIAL PRIMARY KEY,
      assessment_id INTEGER REFERENCES assessments(id),
      user_id INTEGER REFERENCES users(id),
      answers JSONB DEFAULT '[]',
      score INTEGER DEFAULT 0,
      feedback JSONB DEFAULT '{}',
      strong_areas JSONB DEFAULT '[]',
      weak_areas JSONB DEFAULT '[]',
      submitted_at TIMESTAMP DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS suggestions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      job_id INTEGER,
      roadmap JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW()
    )`
  ];

  const alters = [
    `ALTER TABLE job_finder_profiles ADD COLUMN IF NOT EXISTS weak_areas JSONB DEFAULT '[]'`,
    `ALTER TABLE job_finder_profiles ADD COLUMN IF NOT EXISTS last_test_date TIMESTAMP`,
    `ALTER TABLE job_finder_profiles ADD COLUMN IF NOT EXISTS primary_language VARCHAR(100) DEFAULT 'JavaScript'`,
    `ALTER TABLE resumes ADD COLUMN IF NOT EXISTS raw_text TEXT`,
    `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS required_skills JSONB DEFAULT '[]'`,
    `ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`
  ];

  for (const sql of [...tables, ...alters]) {
    try {
      await pool.query(sql);
    } catch(e) {
      if (!e.message.includes('already exists'))
        console.log('Migration warning:', e.message.substring(0,80));
    }
  }
  console.log('Migrations done');
}

async function ensureUsers() {
  const bcrypt = require('bcryptjs');
  const users = [
    { u:'Karthi', e:'karthi@nextgen.com', p:'admin', r:'job_finder' },
    { u:'Mani', e:'mani@nextgen.com', p:'admin', r:'job_poster' },
    { u:'Nithin', e:'nithin58708@gmail.com', p:'admin', r:'admin' }
  ];
  for (const user of users) {
    const hash = await bcrypt.hash(user.p, 10);
    const result = await pool.query(
      `INSERT INTO users(username,email,password,role)
       VALUES($1,$2,$3,$4)
       ON CONFLICT(username) DO UPDATE SET password=$3, role=$4
       RETURNING id`,
      [user.u, user.e, hash, user.r]
    );
    const uid = result.rows[0].id;
    if (user.r === 'job_finder') {
      await pool.query(
        'INSERT INTO job_finder_profiles(user_id) VALUES($1) ON CONFLICT DO NOTHING',
        [uid]
      );
    }
  }
  console.log('Users ready: Karthi, Mani, Nithin');
}

async function seedJobs() {
  const count = await pool.query(
    "SELECT COUNT(*)::int as c FROM jobs WHERE status='approved'"
  );
  if (count.rows[0].c >= 3) {
    console.log('Jobs already seeded');
    return;
  }
  const admin = await pool.query(
    "SELECT id FROM users WHERE role='admin' LIMIT 1"
  );
  const aid = admin.rows[0]?.id;
  const jobs = [
    {
      t:'Full Stack Developer', c:'TechSolutions India',
      d:'Build React and Node.js web applications. React, Node.js, JavaScript, SQL, Git required.',
      s:'6-10 LPA', l:'Chennai',
      sk:['React','Node.js','JavaScript','SQL','Git','HTML','CSS']
    },
    {
      t:'Java Backend Developer', c:'Infosys',
      d:'Spring Boot microservices. Java, MySQL, REST APIs, Maven required.',
      s:'5-8 LPA', l:'Bangalore',
      sk:['Java','Spring Boot','MySQL','REST APIs','Maven','Git']
    },
    {
      t:'Python Developer', c:'Freshworks',
      d:'Django backend developer. Python, Django, PostgreSQL required.',
      s:'6-11 LPA', l:'Chennai',
      sk:['Python','Django','PostgreSQL','REST APIs','Git']
    },
    {
      t:'React Frontend Developer', c:'Zoho Corporation',
      d:'React TypeScript developer with Redux experience required.',
      s:'5-9 LPA', l:'Chennai',
      sk:['React','TypeScript','Redux','CSS','JavaScript','HTML']
    }
  ];
  for (const j of jobs) {
    await pool.query(
      `INSERT INTO jobs(title,company,description,salary,location,
        required_skills,status,posted_by,created_at)
       VALUES($1,$2,$3,$4,$5,$6,'approved',$7,NOW())`,
      [j.t, j.c, j.d, j.s, j.l, JSON.stringify(j.sk), aid]
    );
  }
  console.log('Seeded 4 approved jobs');
}

module.exports = { pool, initDb };
