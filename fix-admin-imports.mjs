import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
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

function fixFile(filePath, replacements) {
  let content = readFileSync(filePath, 'utf-8');
  let updated = content;
  for (const [from, to] of replacements) {
    updated = updated.split(from).join(to);
  }
  if (updated !== content) {
    writeFileSync(filePath, updated, 'utf-8');
    console.log('Fixed:', filePath.split('\\').slice(-4).join('/'));
  }
}

const adminReplacements = [
  ["@/components/product/", "@/components/admin/product/"],
  ["@/components/marketing/", "@/components/admin/marketing/"],
  ["@/components/users/", "@/components/admin/users/"],
];

const allAdminFiles = [
  ...walkDir('apps/storefront/app/(admin)'),
  ...walkDir('apps/storefront/components/admin'),
];

for (const f of allAdminFiles) {
  fixFile(f, adminReplacements);
}
console.log('Done fixing admin imports!');
