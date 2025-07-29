import { describe, it, expect } from 'vitest';
import { appRouter, createTRPCContext } from '../lib/trpc';

describe('tRPC Infrastructure', () => {
  it('should have a complete router structure', () => {
    // Verify all expected routers are present
    expect(appRouter._def.procedures.auth).toBeDefined();
    expect(appRouter._def.procedures.products).toBeDefined();
    expect(appRouter._def.procedures.cart).toBeDefined();
    expect(appRouter._def.procedures.orders).toBeDefined();
    expect(appRouter._def.procedures.messages).toBeDefined();
    expect(appRouter._def.procedures.users).toBeDefined();
    expect(appRouter._def.procedures.categories).toBeDefined();
    expect(appRouter._def.procedures.reviews).toBeDefined();
    expect(appRouter._def.procedures.favorites).toBeDefined();
    expect(appRouter._def.procedures.search).toBeDefined();
    expect(appRouter._def.procedures.health).toBeDefined();
  });

  it('should export proper types', () => {
    // This test ensures TypeScript compilation passes with proper types
    expect(typeof appRouter).toBe('object');
    expect(typeof createTRPCContext).toBe('function');
  });

  it('should have health endpoints', () => {
    const healthRouter = appRouter._def.procedures.health;
    expect(healthRouter._def.procedures.status).toBeDefined();
    expect(healthRouter._def.procedures.detailed).toBeDefined();
  });

  it('should have auth endpoints', () => {
    const authRouter = appRouter._def.procedures.auth;
    expect(authRouter._def.procedures.me).toBeDefined();
    expect(authRouter._def.procedures.updateProfile).toBeDefined();
    expect(authRouter._def.procedures.checkUser).toBeDefined();
    expect(authRouter._def.procedures.createUser).toBeDefined();
  });

  it('should have products endpoints', () => {
    const productsRouter = appRouter._def.procedures.products;
    expect(productsRouter._def.procedures.list).toBeDefined();
    expect(productsRouter._def.procedures.byId).toBeDefined();
    expect(productsRouter._def.procedures.create).toBeDefined();
    expect(productsRouter._def.procedures.update).toBeDefined();
    expect(productsRouter._def.procedures.delete).toBeDefined();
    expect(productsRouter._def.procedures.bySeller).toBeDefined();
  });

  it('should have cart endpoints', () => {
    const cartRouter = appRouter._def.procedures.cart;
    expect(cartRouter._def.procedures.get).toBeDefined();
    expect(cartRouter._def.procedures.add).toBeDefined();
    expect(cartRouter._def.procedures.updateQuantity).toBeDefined();
    expect(cartRouter._def.procedures.remove).toBeDefined();
    expect(cartRouter._def.procedures.clear).toBeDefined();
    expect(cartRouter._def.procedures.count).toBeDefined();
  });
});