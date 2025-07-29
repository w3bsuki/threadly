import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import type { StorybookConfig } from '@storybook/nextjs';

const require = createRequire(import.meta.url);

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
const getAbsolutePath = (value: string) =>
  dirname(require.resolve(join(value, 'package.json')));

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    getAbsolutePath('@storybook/addon-onboarding'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/addon-themes'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/nextjs'),
    options: {
      builder: {
        useSWC: true,
      },
    },
  },
  staticDirs: ['../public'],
  webpackFinal: async (config) => {
    // Disable CSS handling conflicts
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    // Filter out conflicting CSS rules
    config.module.rules = config.module.rules.filter((rule) => {
      if (typeof rule !== 'object' || !rule.test) return true;
      const testString = rule.test.toString();
      return !testString.includes('css') && !testString.includes('scss') && !testString.includes('sass');
    });

    // Add custom CSS handling
    config.module.rules.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader', 'postcss-loader'],
    });

    return config;
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    check: false,
  },
};

export default config;
