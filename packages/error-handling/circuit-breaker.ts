import { logError } from './error-logger';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeout?: number;
  monitoringPeriod?: number;
  minimumRequests?: number;
  onStateChange?: (from: CircuitState, to: CircuitState) => void;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private successes = 0;
  private lastFailureTime?: number;
  private requests: Array<{ timestamp: number; success: boolean }> = [];
  
  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly monitoringPeriod: number;
  private readonly minimumRequests: number;
  private readonly onStateChange?: (from: CircuitState, to: CircuitState) => void;
  
  constructor(private name: string, options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 50; // 50% failure rate
    this.resetTimeout = options.resetTimeout ?? 60000; // 1 minute
    this.monitoringPeriod = options.monitoringPeriod ?? 10000; // 10 seconds
    this.minimumRequests = options.minimumRequests ?? 10;
    this.onStateChange = options.onStateChange;
  }
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should be reset
    this.checkCircuitReset();
    
    if (this.state === CircuitState.OPEN) {
      throw new Error(`Circuit breaker is OPEN for ${this.name}`);
    }
    
    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
  
  private recordSuccess() {
    const now = Date.now();
    this.requests.push({ timestamp: now, success: true });
    this.successes++;
    
    // Clean old requests
    this.cleanOldRequests(now);
    
    if (this.state === CircuitState.HALF_OPEN) {
      // If we're in half-open state and request succeeded, close the circuit
      this.transitionTo(CircuitState.CLOSED);
      this.failures = 0;
      this.successes = 0;
    }
  }
  
  private recordFailure() {
    const now = Date.now();
    this.requests.push({ timestamp: now, success: false });
    this.failures++;
    this.lastFailureTime = now;
    
    // Clean old requests
    this.cleanOldRequests(now);
    
    // Calculate failure rate
    const recentRequests = this.getRecentRequests(now);
    if (recentRequests.length >= this.minimumRequests) {
      const failureRate = (recentRequests.filter(r => !r.success).length / recentRequests.length) * 100;
      
      if (failureRate >= this.failureThreshold && this.state === CircuitState.CLOSED) {
        this.transitionTo(CircuitState.OPEN);
        
        logError(`Circuit breaker opened for ${this.name}`, {
          level: 'warning',
          tags: { circuitBreaker: this.name, state: CircuitState.OPEN },
          extra: { failureRate, recentRequests: recentRequests.length },
        });
      }
    }
    
    if (this.state === CircuitState.HALF_OPEN) {
      // If we're in half-open state and request failed, re-open the circuit
      this.transitionTo(CircuitState.OPEN);
    }
  }
  
  private checkCircuitReset() {
    if (this.state === CircuitState.OPEN && this.lastFailureTime) {
      const now = Date.now();
      if (now - this.lastFailureTime >= this.resetTimeout) {
        this.transitionTo(CircuitState.HALF_OPEN);
        
        logError(`Circuit breaker half-opened for ${this.name}`, {
          level: 'info',
          tags: { circuitBreaker: this.name, state: CircuitState.HALF_OPEN },
        });
      }
    }
  }
  
  private transitionTo(newState: CircuitState) {
    const oldState = this.state;
    this.state = newState;
    
    if (this.onStateChange) {
      this.onStateChange(oldState, newState);
    }
  }
  
  private cleanOldRequests(now: number) {
    this.requests = this.requests.filter(r => now - r.timestamp < this.monitoringPeriod);
  }
  
  private getRecentRequests(now: number): Array<{ timestamp: number; success: boolean }> {
    return this.requests.filter(r => now - r.timestamp < this.monitoringPeriod);
  }
  
  getState(): CircuitState {
    return this.state;
  }
  
  getStats() {
    const now = Date.now();
    const recentRequests = this.getRecentRequests(now);
    const failures = recentRequests.filter(r => !r.success).length;
    const total = recentRequests.length;
    const failureRate = total > 0 ? (failures / total) * 100 : 0;
    
    return {
      state: this.state,
      failureRate,
      totalRequests: total,
      failures,
      successes: total - failures,
    };
  }
  
  reset() {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = undefined;
    this.requests = [];
  }
}

// Global circuit breaker registry
class CircuitBreakerRegistry {
  private static instance: CircuitBreakerRegistry;
  private breakers = new Map<string, CircuitBreaker>();
  
  static getInstance(): CircuitBreakerRegistry {
    if (!CircuitBreakerRegistry.instance) {
      CircuitBreakerRegistry.instance = new CircuitBreakerRegistry();
    }
    return CircuitBreakerRegistry.instance;
  }
  
  getOrCreate(name: string, options?: CircuitBreakerOptions): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(name, options));
    }
    return this.breakers.get(name)!;
  }
  
  get(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name);
  }
  
  getAll(): Map<string, CircuitBreaker> {
    return new Map(this.breakers);
  }
  
  reset(name: string) {
    const breaker = this.breakers.get(name);
    if (breaker) {
      breaker.reset();
    }
  }
  
  resetAll() {
    this.breakers.forEach(breaker => breaker.reset());
  }
  
  getStats() {
    const stats: Record<string, any> = {};
    this.breakers.forEach((breaker, name) => {
      stats[name] = breaker.getStats();
    });
    return stats;
  }
}

export const circuitBreakerRegistry = CircuitBreakerRegistry.getInstance();

// Decorator for circuit breaker protection
export function CircuitBreakerProtected(name: string, options?: CircuitBreakerOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const breaker = circuitBreakerRegistry.getOrCreate(name, options);
      return breaker.execute(() => originalMethod.apply(this, args));
    };
    
    return descriptor;
  };
}

// Wrapper function for circuit breaker protection
export async function withCircuitBreaker<T>(
  name: string,
  fn: () => Promise<T>,
  options?: CircuitBreakerOptions
): Promise<T> {
  const breaker = circuitBreakerRegistry.getOrCreate(name, options);
  return breaker.execute(fn);
}