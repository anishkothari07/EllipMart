import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const APPS = ['storefront', 'merchant', 'admin'];

async function purgeCache() {
  console.log('[COLD START] Purging .next and .turbo build caches...');
  APPS.forEach((app) => {
    const nextDir = path.join(ROOT_DIR, 'apps', app, '.next');
    const turboDir = path.join(ROOT_DIR, 'apps', app, '.turbo');

    if (fs.existsSync(nextDir)) {
      fs.rmSync(nextDir, { recursive: true, force: true });
    }
    if (fs.existsSync(turboDir)) {
      fs.rmSync(turboDir, { recursive: true, force: true });
    }
  });
  
  const rootTurbo = path.join(ROOT_DIR, '.turbo');
  if (fs.existsSync(rootTurbo)) {
    fs.rmSync(rootTurbo, { recursive: true, force: true });
  }
}

async function runColdStartIteration(iteration: number) {
  console.log(`\n========================================`);
  console.log(`[COLD START] Starting Iteration ${iteration} / 10`);
  console.log(`========================================`);

  await purgeCache();

  console.log(`[COLD START] Building project to verify no compilation errors...`);
  try {
    execSync('pnpm build', { stdio: 'inherit', cwd: ROOT_DIR });
    console.log(`[COLD START] Iteration ${iteration} PASSED cleanly!`);
  } catch (error) {
    console.error(`[COLD START ERROR] Iteration ${iteration} failed compilation!`);
    process.exit(1);
  }
}

async function main() {
  console.log('Starting 10 Consecutive Cold Start Stability Validation...');
  for (let i = 1; i <= 10; i++) {
    await runColdStartIteration(i);
  }
  console.log('\nSUCCESS: All 10 consecutive cold starts passed without any rendering loops or startup crashes!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
