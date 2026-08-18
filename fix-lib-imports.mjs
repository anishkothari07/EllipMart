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

const libReplacements = [
  ["@/app/products/actions", "@/app/(seller)/seller/products/actions"],
  ["@/app/orders/actions", "@/app/(seller)/seller/orders/actions"],
  ["@/app/settings/actions", "@/app/(seller)/seller/settings/actions"],
  ["@/app/inventory/actions", "@/app/(seller)/seller/inventory/actions"],
  ["@/app/media/actions", "@/app/(seller)/seller/media/actions"],
  ["@/app/actions", "@/app/(seller)/seller/actions"],
  ["@/app/customers/actions", "@/app/(seller)/seller/customers/actions"],
  ["@/app/marketing/actions", "@/app/(seller)/seller/marketing/actions"],
  ["@/app/brands/actions", "@/app/(seller)/seller/brands/actions"],
  ["@/app/collections/actions", "@/app/(seller)/seller/collections/actions"],
  ["@/app/categories/actions", "@/app/(seller)/seller/categories/actions"],
];

const libFiles = walkDir('apps/storefront/lib/services');

for (const f of libFiles) {
  fixFile(f, libReplacements);
}
console.log('Done fixing lib imports!');
