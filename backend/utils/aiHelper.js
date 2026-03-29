const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

/**
 * Fallback to Gemini API if OpenRouter domain is blocked/unresolved.
 * @param {string} systemPrompt - Instructions for the AI
 * @param {string} userPrompt - Context or data (like the text from the resume)
 * @param {string} [model] - Original model string (ignored here, using gemini flash)
 * @param {boolean} [jsonResponse=true] - Ensure JSON format response output
 * @returns {Promise<any|string>} - Parsed JSON object or pure text string
 */
const callOpenRouter = async (systemPrompt, userPrompt, model, jsonResponse = true) => {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
    }

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        // Using flash to ensure speed and cost-efficiency
        const geminiModel = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemPrompt,
            generationConfig: jsonResponse ? { responseMimeType: "application/json" } : {}
        });

        const result = await geminiModel.generateContent(userPrompt);
        const aiText = result.response.text();

        if (jsonResponse) {
            // Extract JSON block using regex to handle markdown formatting
            const jsonRegex = /```json\n([\s\S]*?)\n```/;
            const match = aiText.match(jsonRegex);
            let jsonString = match ? match[1] : aiText;

            // Remove any remaining markdown formatting if the regex didn't match perfectly
            jsonString = jsonString.replace(/```(?:json)?/g, '').trim();

            try {
                return JSON.parse(jsonString);
            } catch (parseError) {
                console.error("Gemini Response is not valid JSON:", jsonString);
                throw new Error("Invalid JSON format from Gemini");
            }
        }

        return aiText;
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        throw error;
    }
};

/**
 * Robust Offline Skill Extractor
 * Used automatically when Gemini APIs hit Quota Exceeded or Network limits.
 * Extracts *real* skills from the text rather than injecting fake default arrays.
 */
function offlineKeywordExtraction(text) {
    const t = (text || '').toLowerCase();
    
    const dictionary = [
        'java', 'python', 'react', 'node.js', 'javascript', 'html', 'css', 'sql', 'c++', 
        'c#', 'angular', 'typescript', 'git', 'mongodb', 'spring boot', 'django', 'flask', 
        'mysql', 'postgresql', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'linux',
        'machine learning', 'data science', 'go', 'rust', 'ruby', 'swift', 'kotlin',
        'php', 'laravel', 'express', 'vue', 'next.js', 'redis', 'graphql', 'rest apis',
        'figma', 'ui/ux', 'agile', 'scrum', 'jira'
    ];
    
    const foundSkills = dictionary.filter(skill => {
        const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        return regex.test(t);
    });

    return {
        technicalSkills: foundSkills,
        coreTechnologies: [],
        jobRoles: [],
        softSkills: [],
        experienceLevel: null,
        primaryLanguage: foundSkills[0] || null,
        educationDetails: null
    };
}

module.exports = {
    callOpenRouter,
    offlineKeywordExtraction
};
