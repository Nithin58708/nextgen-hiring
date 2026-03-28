const fs = require('fs');
const path = require('path');

const directory = 'e:/Nextgen Hiring/frontend/src';

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            replaceInDir(filePath);
        } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('localhost:5000')) {
                console.log('Fixing:', filePath);
                content = content.replace(/localhost:5000/g, 'localhost:5005');
                fs.writeFileSync(filePath, content, 'utf8');
            }
        }
    });
}

replaceInDir(directory);
console.log('Global port fix complete.');
