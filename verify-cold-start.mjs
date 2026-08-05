import { execSync, spawn } from 'child_process';
import http from 'http';

const MAX_RETRIES = 10;
const PORTS = [3001, 3002, 3003];

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/v1/health`, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 404); // Next.js might return 404 for unconfigured routes, but at least it's up
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => resolve(false));
  });
}

async function runLoop() {
  for (let i = 1; i <= MAX_RETRIES; i++) {
    console.log(`\n--- Iteration ${i}/${MAX_RETRIES} ---`);
    
    // 1. Cleanup
    try {
      execSync('taskkill /F /IM node.exe', { stdio: 'ignore' });
    } catch (e) {} // ignore if no node processes
    try {
      execSync('Remove-Item -Recurse -Force apps\\storefront\\.next ; Remove-Item -Recurse -Force apps\\admin\\.next ; Remove-Item -Recurse -Force apps\\merchant\\.next', { shell: 'powershell', stdio: 'ignore' });
    } catch(e) {}
    
    // 2. Start
    console.log(`Starting dev servers...`);
    const devProcess = spawn('pnpm', ['dev'], { stdio: 'ignore', shell: true });
    
    // 3. Wait for boot
    await wait(15000); // Wait 15s for Turbopack to bind ports
    
    // 4. Verify
    let allUp = true;
    for (const port of PORTS) {
      const isUp = await checkPort(port);
      console.log(`Port ${port}: ${isUp ? 'UP' : 'DOWN'}`);
      if (!isUp) allUp = false;
    }
    
    if (allUp) {
      console.log(`Iteration ${i} SUCCESS`);
    } else {
      console.error(`Iteration ${i} FAILED`);
      process.exit(1);
    }
    
    // 5. Teardown
    devProcess.kill();
    try {
      execSync('taskkill /F /IM node.exe', { stdio: 'ignore' });
    } catch (e) {}
  }
  console.log(`\nAll ${MAX_RETRIES} iterations passed successfully!`);
}

runLoop();
