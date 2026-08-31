import { startTunnel } from 'untun';
import fs from 'fs';

async function main() {
  console.log('Starting Cloudflare tunnel for port 3001...');
  const tunnel = await startTunnel({ port: 3001 });
  const url = await tunnel.getURL();
  console.log('====================================');
  console.log('PUBLIC_TUNNEL_URL=' + url);
  console.log('====================================');
  fs.writeFileSync('./scripts/current_tunnel.txt', url, 'utf-8');
}

main().catch(console.error);
