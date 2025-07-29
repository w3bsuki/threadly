// Test script to verify connection pooling configuration
import { database, checkDatabaseHealth, poolMonitor, formatHealthCheckForLogging } from './index';

async function testConnectionPool() {
  console.log('Testing Database Connection Pool Configuration...\n');

  try {
    // Test 1: Basic connectivity
    console.log('1. Testing basic connectivity...');
    await database.$queryRaw`SELECT 1 as test`;
    console.log('✓ Basic connectivity test passed\n');

    // Test 2: Check health
    console.log('2. Running health check...');
    const health = await checkDatabaseHealth(database);
    console.log(formatHealthCheckForLogging(health));
    console.log('');

    // Test 3: Simulate concurrent queries
    console.log('3. Testing concurrent queries...');
    const concurrentQueries = 20;
    const queries = [];
    
    for (let i = 0; i < concurrentQueries; i++) {
      queries.push(
        database.$queryRaw`SELECT pg_sleep(0.1), ${i} as query_num`
      );
    }

    const startTime = Date.now();
    await Promise.all(queries);
    const duration = Date.now() - startTime;
    
    console.log(`✓ Executed ${concurrentQueries} concurrent queries in ${duration}ms`);
    console.log(`  Average time per query: ${Math.round(duration / concurrentQueries)}ms\n`);

    // Test 4: Check pool metrics after load
    console.log('4. Checking pool metrics after load...');
    const metrics = await poolMonitor.collectMetrics(database);
    console.log('Pool Status:');
    console.log(`  Active connections: ${metrics.stats.activeConnections}`);
    console.log(`  Idle connections: ${metrics.stats.idleConnections}`);
    console.log(`  Total connections: ${metrics.stats.totalConnections}`);
    console.log(`  Max connections: ${metrics.stats.maxConnections}`);
    console.log('');

    // Test 5: Get health status
    console.log('5. Final health status...');
    const finalHealth = poolMonitor.getHealthStatus();
    console.log(`  Status: ${finalHealth.healthy ? 'HEALTHY' : 'UNHEALTHY'}`);
    if (finalHealth.issues.length > 0) {
      console.log('  Issues:');
      finalHealth.issues.forEach(issue => console.log(`    - ${issue}`));
    }

    console.log('\n✅ All connection pool tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await database.$disconnect();
  }
}

// Run the test
testConnectionPool().catch(console.error);