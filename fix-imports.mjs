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

const universalReplacements = [
  // Remove extra /merchant/ nesting
  ["@/components/seller/merchant/", "@/components/seller/"],
  ["@/components/merchant/", "@/components/seller/"],
  // Role strings
  ["'MERCHANT'", "'SELLER'"],
  ['"MERCHANT"', '"SELLER"'],
  // Admin layout: fix relative imports to AdminHeader/AdminSidebar
  ["from '../../components/AdminLayout'", "from '@/components/admin/AdminLayout'"],
  ["from '../../../components/AdminLayout'", "from '@/components/admin/AdminLayout'"],
  ["from '../../components/AdminSidebar'", "from '@/components/admin/AdminSidebar'"],
  ["from '../../components/AdminHeader'", "from '@/components/admin/AdminHeader'"],
  ["from '../../components/SellerLayout'", "from '@/components/admin/SellerLayout'"],
  ["from '../../components/seller-auth-provider'", "from '@/components/admin/seller-auth-provider'"],
  ["from '../../components/product/", "from '@/components/admin/product/"],
  ["from '../../../components/product/", "from '@/components/admin/product/"],
  ["from '../../components/marketing/", "from '@/components/admin/marketing/"],
  ["from '../../components/layout/", "from '@/components/admin/layout/"],
  ["from '../../components/users/", "from '@/components/admin/users/"],
  // Seller layout self-references
  ["from './Sidebar'", "from '@/components/seller/layout/Sidebar'"],
  ["from './MobileSidebar'", "from '@/components/seller/layout/MobileSidebar'"],
  ["from './Header'", "from '@/components/seller/layout/Header'"],
  ["from './SidebarItem'", "from '@/components/seller/layout/SidebarItem'"],
  ["from './SidebarSection'", "from '@/components/seller/layout/SidebarSection'"],
  // Auth actions references from layout components
  ["from '../../../app/actions'", "from '@/app/(seller)/seller/actions'"],
  ["from '../../../../app/actions'", "from '@/app/(seller)/seller/actions'"],
];

const allSellerFiles = [
  ...walkDir('apps/storefront/app/(seller)'),
  ...walkDir('apps/storefront/components/seller'),
];
const allAdminFiles = [
  ...walkDir('apps/storefront/app/(admin)'),
  ...walkDir('apps/storefront/components/admin'),
];

console.log(`Processing ${allSellerFiles.length + allAdminFiles.length} total files...`);
for (const f of [...allSellerFiles, ...allAdminFiles]) {
  fixFile(f, universalReplacements);
}
console.log('Done!');
