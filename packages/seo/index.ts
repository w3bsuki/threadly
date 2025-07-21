// Core SEO utilities
export * from './metadata';
export * from './structured-data';

// Marketplace-specific SEO enhancements
export * from './marketplace-seo';

// Re-export commonly used types
export type { Metadata } from 'next';
export type { WithContext, Product, Organization, WebSite } from 'schema-dts';