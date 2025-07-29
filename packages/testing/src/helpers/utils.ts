import { vi } from 'vitest';

// Time and date utilities
export class TimeTestUtils {
  private static originalDate = Date;
  private static mockDate: Date | null = null;

  // Mock current date
  static setMockDate(date: string | Date) {
    TimeTestUtils.mockDate = typeof date === 'string' ? new Date(date) : date;

    global.Date = class extends Date {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(TimeTestUtils.mockDate!);
        } else {
          // @ts-expect-error - TypeScript doesn't like spreading args in Date constructor
          super(...args);
        }
      }

      static now() {
        return TimeTestUtils.mockDate!.getTime();
      }
    } as DateConstructor;
  }

  // Restore original Date
  static restoreDate() {
    global.Date = TimeTestUtils.originalDate;
    TimeTestUtils.mockDate = null;
  }

  // Create date relative to mock date
  static addDays(days: number): Date {
    if (!TimeTestUtils.mockDate) {
      throw new Error('Mock date not set. Call setMockDate first.');
    }
    const newDate = new Date(TimeTestUtils.mockDate);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }

  static addHours(hours: number): Date {
    if (!TimeTestUtils.mockDate) {
      throw new Error('Mock date not set. Call setMockDate first.');
    }
    const newDate = new Date(TimeTestUtils.mockDate);
    newDate.setHours(newDate.getHours() + hours);
    return newDate;
  }

  static addMinutes(minutes: number): Date {
    if (!TimeTestUtils.mockDate) {
      throw new Error('Mock date not set. Call setMockDate first.');
    }
    const newDate = new Date(TimeTestUtils.mockDate);
    newDate.setMinutes(newDate.getMinutes() + minutes);
    return newDate;
  }
}

// Console utilities
export class ConsoleTestUtils {
  static mockConsole() {
    const mocks = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
    };

    return mocks;
  }

  static restoreConsole() {}

  static suppressConsole(
    types: ('log' | 'error' | 'warn' | 'info')[] = ['error']
  ) {
    const mocks: Record<string, any> = {};

    types.forEach((type) => {
      mocks[type] = console[type];
      console[type] = vi.fn();
    });

    return () => {
      types.forEach((type) => {
        console[type] = mocks[type];
      });
    };
  }
}

// Async utilities
export class AsyncTestUtils {
  // Wait for a specific condition
  static async waitFor(
    condition: () => boolean | Promise<boolean>,
    options: { timeout?: number; interval?: number } = {}
  ): Promise<void> {
    const { timeout = 5000, interval = 100 } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const result = await condition();
      if (result) return;
      await AsyncTestUtils.sleep(interval);
    }

    throw new Error(`Condition not met within ${timeout}ms`);
  }

  // Sleep for specified milliseconds
  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Wait for next tick
  static nextTick(): Promise<void> {
    return new Promise((resolve) => process.nextTick(resolve));
  }

  // Wait for multiple promises with timeout
  static async waitForAll<T>(
    promises: Promise<T>[],
    timeout = 5000
  ): Promise<T[]> {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout)
    );

    return Promise.race([Promise.all(promises), timeoutPromise]);
  }

  // Retry operation with exponential backoff
  static async retry<T>(
    operation: () => Promise<T>,
    options: {
      maxAttempts?: number;
      baseDelay?: number;
      maxDelay?: number;
      backoffMultiplier?: number;
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      baseDelay = 100,
      maxDelay = 1000,
      backoffMultiplier = 2,
    } = options;

    let lastError: Error;
    let delay = baseDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxAttempts) {
          throw lastError;
        }

        await AsyncTestUtils.sleep(Math.min(delay, maxDelay));
        delay *= backoffMultiplier;
      }
    }

    throw lastError!;
  }
}

// Environment utilities
export class EnvTestUtils {
  private static originalEnv: Record<string, string | undefined> = {};

  // Set environment variables for test
  static setEnv(vars: Record<string, string>) {
    Object.entries(vars).forEach(([key, value]) => {
      EnvTestUtils.originalEnv[key] = process.env[key];
      process.env[key] = value;
    });
  }

  // Restore original environment
  static restoreEnv() {
    Object.entries(EnvTestUtils.originalEnv).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
    EnvTestUtils.originalEnv = {};
  }

  // Create test environment
  static createTestEnv(overrides: Record<string, string> = {}) {
    return {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      CLERK_SECRET_KEY: 'test_clerk_secret',
      STRIPE_SECRET_KEY: 'sk_test_123',
      NEXTAUTH_SECRET: 'test_nextauth_secret',
      REDIS_URL: 'redis://localhost:6379',
      ...overrides,
    };
  }
}

// Random data generators
export class DataGenerators {
  // Generate random string
  static randomString(length = 8): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Generate random email
  static randomEmail(): string {
    return `test-${DataGenerators.randomString(8)}@example.com`;
  }

  // Generate random phone
  static randomPhone(): string {
    return `+1${Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000}`;
  }

  // Generate random price
  static randomPrice(min = 1000, max = 100_000): number {
    return Math.floor(Math.random() * (max - min) + min);
  }

  // Generate random date
  static randomDate(start = new Date(2020, 0, 1), end = new Date()): Date {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  }

  // Generate random user data
  static randomUser() {
    const firstName = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa'][
      Math.floor(Math.random() * 6)
    ];
    const lastName = [
      'Smith',
      'Johnson',
      'Williams',
      'Brown',
      'Jones',
      'Garcia',
    ][Math.floor(Math.random() * 6)];

    return {
      id: `user_${DataGenerators.randomString(12)}`,
      clerkId: `clerk_${DataGenerators.randomString(12)}`,
      email: DataGenerators.randomEmail(),
      firstName,
      lastName,
      imageUrl: `https://example.com/avatar-${DataGenerators.randomString(8)}.jpg`,
      location: 'Test City, TC',
      averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0
      totalSales: Math.floor(Math.random() * 100),
      createdAt: DataGenerators.randomDate(),
      updatedAt: new Date(),
    };
  }

  // Generate random product data
  static randomProduct(sellerId?: string, categoryId?: string) {
    const titles = [
      'iPhone 13 Pro',
      'Nike Air Max',
      'MacBook Pro',
      'Samsung Galaxy',
      'Adidas Sneakers',
      'iPad Air',
    ];

    const conditions = [
      'NEW_WITH_TAGS',
      'NEW_WITHOUT_TAGS',
      'VERY_GOOD',
      'GOOD',
      'SATISFACTORY',
    ];

    return {
      id: `prod_${DataGenerators.randomString(12)}`,
      title: titles[Math.floor(Math.random() * titles.length)],
      description: `High quality ${titles[Math.floor(Math.random() * titles.length)]?.toLowerCase() || 'item'} in excellent condition.`,
      price: DataGenerators.randomPrice(),
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      status: 'AVAILABLE',
      sellerId: sellerId || `user_${DataGenerators.randomString(12)}`,
      categoryId: categoryId || `cat_${DataGenerators.randomString(12)}`,
      createdAt: DataGenerators.randomDate(),
      updatedAt: new Date(),
    };
  }
}

// File system test utilities
export class FileTestUtils {
  // Create temporary file path
  static createTempPath(extension = '.tmp'): string {
    return `/tmp/test-${DataGenerators.randomString(12)}${extension}`;
  }

  // Mock file upload
  static createMockFile(
    name = 'test.jpg',
    type = 'image/jpeg',
    size = 1024
  ): File {
    const content = new Array(size).fill('a').join('');
    return new File([content], name, { type });
  }

  // Mock file list
  static createMockFileList(files: File[]): FileList {
    const fileList = files as any;
    fileList.item = (index: number) => files[index] || null;
    fileList.length = files.length;
    return fileList as FileList;
  }
}

// Performance test utilities
export class PerformanceTestUtils {
  // Measure execution time
  static async measureTime<T>(
    operation: () => Promise<T>
  ): Promise<{ result: T; time: number }> {
    const start = performance.now();
    const result = await operation();
    const time = performance.now() - start;
    return { result, time };
  }

  // Assert operation completes within time limit
  static async assertTimeLimit<T>(
    operation: () => Promise<T>,
    maxTime: number,
    message?: string
  ): Promise<T> {
    const { result, time } = await PerformanceTestUtils.measureTime(operation);

    if (time > maxTime) {
      throw new Error(
        message ||
          `Operation took ${time.toFixed(2)}ms, expected < ${maxTime}ms`
      );
    }

    return result;
  }

  // Memory usage measurement (Node.js only)
  static getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage();
    }
    return null;
  }
}

// Error testing utilities
export class ErrorTestUtils {
  // Assert function throws specific error
  static async assertThrows<T extends Error>(
    operation: () => Promise<any>,
    expectedError?: new (...args: any[]) => T,
    expectedMessage?: string | RegExp
  ): Promise<T> {
    let thrownError: any;

    try {
      await operation();
      throw new Error('Expected operation to throw an error');
    } catch (error) {
      thrownError = error;
    }

    if (expectedError && !(thrownError instanceof expectedError)) {
      throw new Error(
        `Expected error of type ${expectedError.name}, got ${thrownError.constructor.name}`
      );
    }

    if (expectedMessage) {
      const messageMatches =
        typeof expectedMessage === 'string'
          ? thrownError.message === expectedMessage
          : expectedMessage.test(thrownError.message);

      if (!messageMatches) {
        throw new Error(
          `Expected error message "${expectedMessage}", got "${thrownError.message}"`
        );
      }
    }

    return thrownError;
  }

  // Create mock error
  static createMockError(message = 'Test error', code?: string): Error {
    const error = new Error(message);
    if (code) {
      (error as any).code = code;
    }
    return error;
  }
}

// Test data cleanup
export class TestCleanup {
  private static cleanupFunctions: (() => void | Promise<void>)[] = [];

  // Register cleanup function
  static register(cleanup: () => void | Promise<void>) {
    TestCleanup.cleanupFunctions.push(cleanup);
  }

  // Run all cleanup functions
  static async runAll() {
    await Promise.all(
      TestCleanup.cleanupFunctions.map(async (cleanup) => {
        try {
          await cleanup();
        } catch (error) {}
      })
    );
    TestCleanup.cleanupFunctions = [];
  }

  // Clear all registered cleanup functions
  static clear() {
    TestCleanup.cleanupFunctions = [];
  }
}

// Export commonly used utilities
export {
  TimeTestUtils as time,
  ConsoleTestUtils as console,
  AsyncTestUtils as async,
  EnvTestUtils as env,
  DataGenerators as generate,
  FileTestUtils as file,
  PerformanceTestUtils as performance,
  ErrorTestUtils as error,
  TestCleanup as cleanup,
};
