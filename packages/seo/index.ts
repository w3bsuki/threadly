// Core SEO utilities

// Re-export commonly used types
export type { Metadata } from 'next';
export type { Organization, Product, WebSite, WithContext } from 'schema-dts';

// Marketplace-specific SEO enhancements
export * from './marketplace-seo';
export * from './metadata';
export * from './structured-data';
