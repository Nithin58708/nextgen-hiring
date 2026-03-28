const { pool } = require('./db');
const { getAssessment } = require('./controllers/assessmentController');
require('dotenv').config();

const test = async () => {
    // Mock req and res
    const req = {
        params: { jobRole: 'Software Engineer' },
        user: { id: 1 } // Mani is id 1 or Karthi or something
    };
    const res = {
        status: (code) => {
            console.log('Status:', code);
            return res;
        },
        json: (data) => {
            console.log('JSON Output:', JSON.stringify(data, null, 2));
            return res;
        }
    };

    try {
        console.log('Testing getAssessment manually...');
        await getAssessment(req, res);
        process.exit(0);
    } catch (err) {
        console.error('MANUAL TEST CRASH:', err);
        process.exit(1);
    }
};

test();
