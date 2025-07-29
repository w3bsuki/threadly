/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['./index.js'],
  env: {
    node: true,
  },
  rules: {
    // Node.js specific
    'no-process-exit': 'error',
    'no-sync': ['error', { allowAtRootLevel: true }],
    'no-path-concat': 'error',
    'handle-callback-err': 'error',
    'no-new-require': 'error',
    'global-require': 'error',
    'no-mixed-requires': ['error', { grouping: true }],
    
    // Async/Promise
    'no-async-promise-executor': 'error',
    'no-await-in-loop': 'warn',
    'no-promise-executor-return': 'error',
    'prefer-promise-reject-errors': 'error',
    'no-return-await': 'error',
    
    // Security
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    
    // Error handling
    'no-throw-literal': 'error',
    'prefer-promise-reject-errors': 'error',
    
    // Performance
    'no-buffer-constructor': 'error',
  },
  overrides: [
    {
      files: ['*.test.{js,ts}', '*.spec.{js,ts}'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: ['scripts/**/*.{js,ts}'],
      rules: {
        'no-console': 'off',
        'no-sync': 'off',
      },
    },
  ],
}