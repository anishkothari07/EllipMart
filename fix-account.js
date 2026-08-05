const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('page.tsx') || file.endsWith('layout.tsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('apps/storefront/app/(storefront)/account');
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    if (!content.includes('force-dynamic')) {
        fs.writeFileSync(f, "export const dynamic = 'force-dynamic';\n" + content);
        console.log('Updated: ' + f);
    }
});
