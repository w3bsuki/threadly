#!/usr/bin/env node
import { getCacheService } from '@repo/cache';
import { database } from '@repo/database';
import { performance } from 'perf_hooks';

/**
 * Performance benchmarks for refactored code
 * Run with: pnpm tsx scripts/performance-benchmark.ts
 */

interface BenchmarkResult {
  name: string;
  duration: number;
  operations?: number;
  opsPerSecond?: number;
}

class Benchmark {
  private results: BenchmarkResult[] = [];

  async measure(name: string, fn: () => Promise<void>, operations = 1) {
    // Warm-up
    await fn();

    // Actual measurement
    const start = performance.now();
    for (let i = 0; i < operations; i++) {
      await fn();
    }
    const end = performance.now();

    const duration = end - start;
    const opsPerSecond = operations / (duration / 1000);

    this.results.push({
      name,
      duration,
      operations,
      opsPerSecond,
    });

    if (operations > 1) {
    }
  }

  printResults() {
    for (const result of this.results) {
      const name = result.name.padEnd(40);
      const duration = `${result.duration.toFixed(2)}ms`.padEnd(12);
      const ops = result.opsPerSecond ? result.opsPerSecond.toFixed(2) : 'N/A';
    }
  }
}

async function runBenchmarks() {
  const benchmark = new Benchmark();
  const cache = getCacheService();

  // Database benchmarks
  await benchmark.measure(
    'Database: Simple Query',
    async () => {
      await database.user.findFirst();
    },
    100
  );

  await benchmark.measure(
    'Database: Complex Query with Relations',
    async () => {
      await database.product.findFirst({
        include: {
          seller: true,
          category: true,
          images: true,
          _count: {
            select: {
              favorites: true,
              reviews: true,
            },
          },
        },
      });
    },
    50
  );

  await benchmark.measure(
    'Database: List Products (20)',
    async () => {
      await database.product.findMany({
        take: 20,
        include: {
          images: {
            take: 1,
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    },
    20
  );

  // Cache benchmarks
  await benchmark.measure(
    'Cache: Set Operation',
    async () => {
      await cache.cacheProduct({
        id: 'test-123',
        title: 'Test Product',
        price: 99.99,
      });
    },
    100
  );

  await benchmark.measure(
    'Cache: Get Operation',
    async () => {
      await cache.getProduct('test-123');
    },
    100
  );

  await benchmark.measure(
    'Cache: Cache-aside Pattern',
    async () => {
      await cache.remember(
        'benchmark-test',
        async () => ({
          data: 'test',
          timestamp: Date.now(),
        }),
        60
      );
    },
    100
  );

  // Repository pattern benchmarks
  const mockUserRepo = {
    findByClerkId: async (id: string) => {
      return database.user.findUnique({
        where: { clerkId: id },
        select: { id: true, role: true, clerkId: true },
      });
    },
  };

  await benchmark.measure(
    'Repository Pattern: User Lookup',
    async () => {
      await mockUserRepo.findByClerkId('test-clerk-id');
    },
    50
  );

  // Bundle size analysis (simulated)

  // Memory usage
  const memUsage = process.memoryUsage();

  benchmark.printResults();
}

// Run benchmarks
runBenchmarks().catch(console.error);
