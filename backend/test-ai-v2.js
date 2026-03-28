const { GoogleGenerativeAI } = require('@google/generative-ai');
const apiKey = 'AIzaSyBqsbo1oE_RfPs8pRSli-59vgQNHo4-wNo';
const genAI = new GoogleGenerativeAI(apiKey);

async function testAI() {
  const models = ['gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-pro'];
  for (const m of models) {
    try {
      console.log(`Testing model: ${m}`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent('say hello');
      console.log(`Model ${m} worked:`, result.response.text());
    } catch (err) {
      console.log(`Model ${m} failed:`, err.message);
    }
  }
}

testAI();
