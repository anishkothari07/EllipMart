async function runLoadBenchmark() {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
  const targetEndpoints = ['/api/v1/health', '/manifest.json'];
  const concurrencyLevels = [50, 100, 250];

  console.log('=====================================================');
  console.log(' EllipMart Load Testing & Performance Benchmark Tool ');
  console.log('=====================================================');

  for (const endpoint of targetEndpoints) {
    for (const concurrency of concurrencyLevels) {
      console.log(`\nTesting endpoint: ${endpoint} (Concurrency: ${concurrency} requests)`);
      
      const latencies: number[] = [];
      let successCount = 0;
      let errorCount = 0;
      const startTime = Date.now();

      const promises = Array.from({ length: concurrency }).map(async () => {
        const reqStart = Date.now();
        try {
          const res = await fetch(`${baseUrl}${endpoint}`);
          const duration = Date.now() - reqStart;
          if (res.status === 200) {
            successCount++;
            latencies.push(duration);
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
        }
      });

      await Promise.all(promises);

      const totalTimeMs = Date.now() - startTime;
      const rps = Math.round((concurrency / (totalTimeMs / 1000)) * 100) / 100;
      latencies.sort((a, b) => a - b);
      const avgMs = Math.round(latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1));
      const p95Ms = latencies[Math.floor(latencies.length * 0.95)] || 0;
      const errorRate = ((errorCount / concurrency) * 100).toFixed(1);

      console.log(`  - Total Time: ${totalTimeMs}ms`);
      console.log(`  - Throughput: ${rps} req/sec`);
      console.log(`  - Avg Latency: ${avgMs}ms`);
      console.log(`  - P95 Latency: ${p95Ms}ms`);
      console.log(`  - Error Rate: ${errorRate}%`);
    }
  }

  console.log('\n=====================================================');
  console.log(' Load Benchmark Execution Completed Successfully ');
  console.log('=====================================================');
}

runLoadBenchmark().catch(console.error);
