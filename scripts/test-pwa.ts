async function verifyPWA() {
  const baseUrl = 'http://localhost:3000';
  const urls = [
    '/manifest.json',
    '/sw.js',
    '/favicon.ico',
    '/icon-192.png',
    '/icon-512.png',
  ];

  console.log('Testing PWA Asset endpoints on dev server...');
  let failed = false;

  for (const url of urls) {
    try {
      const res = await fetch(`${baseUrl}${url}`);
      console.log(`[${res.status}] ${url} (${res.headers.get('content-type')})`);
      if (res.status !== 200) {
        failed = true;
      }
      if (url === '/manifest.json') {
        const json = await res.json();
        console.log('Manifest content validation:');
        console.log('- short_name:', json.short_name);
        console.log('- display:', json.display);
        console.log('- icons count:', json.icons?.length);
        console.log('- icon sizes:', json.icons?.map((i: any) => i.sizes).join(', '));
      }
    } catch (e: any) {
      console.error(`ERROR fetching ${url}:`, e.message);
      failed = true;
    }
  }

  if (failed) {
    console.error('PWA Verification FAILED!');
    process.exit(1);
  } else {
    console.log('ALL PWA endpoints verified SUCCESSFUL!');
  }
}

verifyPWA();
