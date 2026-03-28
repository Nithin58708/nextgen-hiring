const { pool } = require('./db');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const test = async () => {
  const jobRole = "Software Engineer";
  const userId = 1; // Karthi

  try {
    const profileRes = await pool.query("SELECT * FROM job_finder_profiles WHERE user_id = $1", [userId]);
    let skills = ["JavaScript", "React", "Node.js", "SQL"];
    console.log("Skills used:", skills);

    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBqsbo1oE_RfPs8pRSli-59vgQNHo4-wNo';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Generate 2 multiple choice questions for a ${jobRole} interview. Return JSON only.`;

    const result = await model.generateContent(prompt);
    console.log("AI Response:", result.response.text());
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
};

test();
