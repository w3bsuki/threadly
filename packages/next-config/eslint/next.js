/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    './index.js',
    'next/core-web-vitals',
    'next/typescript',
  ],
  plugins: ['react', 'react-hooks'],
  rules: {
    // React
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/no-unescaped-entities': 'off',
    'react/jsx-no-target-blank': 'error',
    'react/jsx-key': ['error', { checkFragmentShorthand: true }],
    'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
    'react/self-closing-comp': ['error', { component: true, html: true }],
    'react/jsx-sort-props': [
      'error',
      {
        callbacksLast: true,
        shorthandFirst: true,
        reservedFirst: true,
      },
    ],
    
    // React Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Next.js specific
    '@next/next/no-html-link-for-pages': 'error',
    '@next/next/no-img-element': 'error',
    
    // Import
    'import/no-default-export': [
      'error',
      {
        exceptions: [
          'app/**/page.tsx',
          'app/**/layout.tsx',
          'app/**/error.tsx',
          'app/**/loading.tsx',
          'app/**/not-found.tsx',
          'app/**/global-error.tsx',
          'app/**/route.ts',
          'app/**/default.tsx',
          'app/**/opengraph-image.tsx',
          'app/**/twitter-image.tsx',
          'app/**/icon.tsx',
          'app/**/apple-icon.tsx',
          'app/**/robots.ts',
          'app/**/sitemap.ts',
          'app/**/manifest.ts',
          '*.config.*',
          'tailwind.config.*',
          'postcss.config.*',
          'middleware.ts',
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['app/**/*.{ts,tsx}'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    {
      files: ['*.stories.{ts,tsx}'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
}