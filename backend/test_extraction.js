const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

async function testExtraction() {
    const resumePath = path.resolve('e:/Nextgen Hiring/backend/uploads/1773746683933-Nithin-Nithin-(6).pdf');
    const dataBuffer = fs.readFileSync(resumePath);
    const data = await pdf(dataBuffer);
    const resumeText = data.text;

    const MASTER = [
      'Java','JavaScript','Python','React','Node.js','SQL','HTML','CSS',
      'PostgreSQL','MongoDB','Express','C++','C#','ASP.NET MVC','ASP.NET',
      'jQuery','Git','REST API','OOP','TypeScript','Bootstrap','PHP',
      'pgAdmin','CRUD','MVC','Stored Procedures','.NET','JSON','AJAX',
      'Visual Studio','Spring Boot','Docker','AWS','Django','Laravel',
      'MySQL','Redis','Angular','Vue.js','Linux','Tailwind','GraphQL',
      'FastAPI','Hibernate','Maven','Gradle','Kotlin','Swift','Flutter',
      'Machine Learning','TensorFlow','pandas','NumPy','Agile','Scrum',
      'GitHub','GitLab','JIRA','Postman','Swagger','Jenkins',
      'Object Oriented Programming','Data Structures','Algorithms',
      'Problem Solving','Team Player','Communication',
      'MVC Architecture','Database Management','Web Development',
      'Entity Framework','WPF','WCF','Unity','Tableau','PowerBI','Oracle'
    ];

    const textLower = resumeText.toLowerCase();
    const keywordSkills = MASTER.filter(skill => {
      const skillLower = skill.toLowerCase();
      if (skill === '.NET') return textLower.match(/\.?net\b/);
      if (skill === 'C#') return textLower.includes('c#');
      return textLower.includes(skillLower);
    });

    console.log('--- TEST EXTRACTION RESULTS ---');
    console.log('Keyword Skills Found:', keywordSkills);
    
    const required = ['C#', 'SQL', 'JavaScript', 'ASP.NET MVC', 'pgAdmin', 'CRUD', 'MVC', '.NET'];
    const missing = required.filter(r => !keywordSkills.includes(r));
    
    if (missing.length === 0) {
        console.log('SUCCESS: All target skills extracted!');
    } else {
        console.log('MISSING SKILLS:', missing);
    }
}

testExtraction().catch(console.error);
