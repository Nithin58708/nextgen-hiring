const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const DEFAULT_MODEL = 'meta-llama/llama-3.3-70b-instruct:free'; // Fast, free robust JSON model

/**
 * Centralized proxy function to communicate with OpenRouter.
 * @param {string} systemPrompt - Instructions for the AI
 * @param {string} userPrompt - Context or data (like the text from the resume)
 * @param {string} [model] - OpenRouter model (optional)
 * @param {boolean} [jsonResponse=true] - Ensure JSON format response output
 * @returns {Promise<any|string>} - Parsed JSON object or pure text string
 */
const callOpenRouter = async (systemPrompt, userPrompt, model = DEFAULT_MODEL, jsonResponse = true) => {
    if (!OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not defined in the environment variables.");
    }

    try {
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                response_format: jsonResponse ? { type: "json_object" } : undefined
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'http://localhost:5005', // Required by OpenRouter for free tier rank
                    'X-Title': 'NextGen Hiring Platform',     // Required by OpenRouter
                    'Content-Type': 'application/json'
                }
            }
        );

        const aiText = response.data.choices[0].message.content;

        if (jsonResponse) {
            try {
                // Pre-process any markdown code blocks the AI might still throw at us despite JSON response mode
                const cleanedJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(cleanedJson);
            } catch (jsonErr) {
                console.error("OpenRouter Response is not valid JSON:", aiText);
                throw new Error("AI returned malformed JSON");
            }
        }

        return aiText;
    } catch (error) {
        console.error("OpenRouter API Error:", error.response?.data || error.message);
        throw error;
    }
};

module.exports = {
    callOpenRouter
};
