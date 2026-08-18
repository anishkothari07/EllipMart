import { readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

function walkDir(dir) {
  const files = [];
  try {
    for (const item of readdirSync(dir)) {
      const full = join(dir, item);
      try {
        if (statSync(full).isDirectory()) files.push(...walkDir(full));
        else if (full.endsWith('.tsx') || full.endsWith('.ts')) files.push(full);
      } catch {}
    }
  } catch {}
  return files;
}

const dirs = [
  'apps/storefront/app/(seller)',
  'apps/storefront/app/(admin)',
  'apps/storefront/components/seller',
  'apps/storefront/components/admin',
];
let allFiles = [];
for (const d of dirs) allFiles.push(...walkDir(d));

const patterns = [
  '@/components/merchant',
  "components/AdminLayout'",
  "components/SellerLayout'",
  "components/seller-auth-provider'",
  "'MERCHANT'",
  '"MERCHANT"',
];

let found = 0;
for (const f of allFiles) {
  const content = readFileSync(f, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    for (const p of patterns) {
      if (line.includes(p)) {
        console.log(f.split('\\').slice(-4).join('/') + ':' + (i+1) + ': ' + line.trim().substring(0, 100));
        found++;
        break;
      }
    }
  });
}
console.log('\nTotal issues:', found);
