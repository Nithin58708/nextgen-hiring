const fs = require('fs');
const path = require('path');

const serverContent = fs.readFileSync('server.js', 'utf8');
const requires = serverContent.match(/require\(['"](.+?)['"]\)/g) || [];

console.log('Checking dependencies for server.js:');
requires.forEach(req => {
    const mod = req.match(/['"](.+?)['"]/)[1];
    if (mod.startsWith('.')) {
        const fullPath = path.resolve(mod.endsWith('.js') ? mod : mod + '.js');
        if (fs.existsSync(fullPath) || fs.existsSync(mod)) {
            console.log(`[OK] Internal: ${mod}`);
        } else {
            console.log(`[FAIL] Internal: ${mod} (Path: ${fullPath})`);
        }
    } else {
        try {
            require.resolve(mod);
            console.log(`[OK] External: ${mod}`);
        } catch (e) {
            console.log(`[FAIL] External: ${mod}`);
        }
    }
});
