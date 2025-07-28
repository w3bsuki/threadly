import {
  defaults,
  type NoseconeOptions,
  withVercelToolbar,
} from '@nosecone/next';

export { createMiddleware as noseconeMiddleware } from '@nosecone/next';

// Enhanced CSP configuration for e-commerce marketplace
export const createCSPConfig = (
  options: {
    allowStripe?: boolean;
    allowUploadThing?: boolean;
    allowSentry?: boolean;
    allowPosthog?: boolean;
    allowVercelToolbar?: boolean;
    allowInlineStyles?: boolean;
  } = {}
) => {
  const {
    allowStripe = true,
    allowUploadThing = true,
    allowSentry = true,
    allowPosthog = true,
    allowVercelToolbar = false,
    allowInlineStyles = false,
  } = options;

  const sources = {
    self: "'self'",
    data: 'data:',
    blob: 'blob:',
    none: "'none'",
    unsafeInline: "'unsafe-inline'",
    unsafeEval: "'unsafe-eval'",
  };

  const defaultSrc = [sources.self];
  const scriptSrc = [sources.self];
  const styleSrc = [sources.self, sources.data];
  const imgSrc = [sources.self, sources.data, sources.blob, 'https:'];
  const connectSrc = [sources.self];
  const frameSrc = [sources.none];
  const fontSrc = [sources.self, sources.data];

  // Add Stripe if enabled
  if (allowStripe) {
    scriptSrc.push('https://js.stripe.com');
    frameSrc.push('https://js.stripe.com', 'https://hooks.stripe.com');
    connectSrc.push('https://api.stripe.com');
  }

  // Add UploadThing if enabled
  if (allowUploadThing) {
    connectSrc.push('https://uploadthing.com', 'https://*.uploadthing.com');
    imgSrc.push('https://uploadthing.com', 'https://*.uploadthing.com');
  }

  // Add Sentry if enabled
  if (allowSentry) {
    connectSrc.push('https://*.sentry.io');
  }

  // Add PostHog if enabled
  if (allowPosthog) {
    scriptSrc.push('https://app.posthog.com');
    connectSrc.push('https://app.posthog.com');
  }

  // Add Vercel Toolbar if enabled
  if (allowVercelToolbar) {
    scriptSrc.push('https://vercel.live');
    connectSrc.push('https://vercel.live');
  }

  // Allow inline styles if needed (for development)
  if (allowInlineStyles) {
    styleSrc.push(sources.unsafeInline);
  }

  return {
    'default-src': defaultSrc,
    'script-src': scriptSrc,
    'style-src': styleSrc,
    'img-src': imgSrc,
    'connect-src': connectSrc,
    'frame-src': frameSrc,
    'font-src': fontSrc,
    'object-src': [sources.none],
    'base-uri': [sources.self],
    'form-action': [sources.self],
    'frame-ancestors': [sources.none],
    'upgrade-insecure-requests': true,
  };
};

// Nosecone security headers configuration
// https://docs.arcjet.com/nosecone/quick-start
export const noseconeOptions: NoseconeOptions = {
  ...defaults,
  // Content Security Policy (CSP) is disabled by default because the values
  // depend on which Threadly features are enabled. See the security
  // documentation for guidance on how to configure it.
  contentSecurityPolicy: false,
};

// Enhanced options with CSP for production
export const noseconeOptionsWithCSP: NoseconeOptions = {
  ...defaults,
  contentSecurityPolicy: createCSPConfig() as any,
};

// Development options with relaxed CSP
export const noseconeOptionsForDev: NoseconeOptions = {
  ...defaults,
  contentSecurityPolicy: createCSPConfig({
    allowInlineStyles: true,
    allowVercelToolbar: true,
  }) as any,
};

export const noseconeOptionsWithToolbar: NoseconeOptions =
  withVercelToolbar(noseconeOptions);
