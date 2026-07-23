const fs = require('fs');
const path = require('path');

function walk(d) {
  fs.readdirSync(d).forEach(f => {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.ts')) {
      let content = fs.readFileSync(p, 'utf8');
      let modified = false;
      if (content.includes(`from '@/lib/prisma'`)) {
        content = content.replace(/from '@\/lib\/prisma'/g, `from '@/lib/prisma/client'`);
        modified = true;
      }
      if (content.includes(`import { AppError } from '@/lib/utils/response'`)) {
        content = content.replace(/import \{ AppError \} from '@\/lib\/utils\/response'/g, `import { AppError } from '@/lib/utils/errorHandler'`);
        modified = true;
      }
      if (modified) {
        fs.writeFileSync(p, content);
        console.log('Fixed', p);
      }
    }
  });
}
walk('lib/modules');
