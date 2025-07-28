import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const TypographyToken = ({
  name,
  cssVar,
  value,
  example,
  description,
}: {
  name: string;
  cssVar: string;
  value: string;
  example?: string;
  description?: string;
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(cssVar);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border p-6 transition-colors hover:bg-muted/50">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{name}</h3>
          {description && (
            <p className="mt-1 text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        <div className="text-right">
          <code
            className="cursor-pointer rounded bg-muted px-2 py-1 text-xs hover:bg-muted/80"
            onClick={handleCopy}
          >
            {cssVar}
          </code>
          {copied && (
            <span className="ml-2 text-green-500 text-xs">Copied!</span>
          )}
        </div>
      </div>
      <div className="mb-3 text-muted-foreground text-sm">{value}</div>
      {example && (
        <div
          className="mt-4 rounded border border-border bg-background p-4"
          style={{ fontSize: `var(${cssVar})` }}
        >
          {example}
        </div>
      )}
    </div>
  );
};

const FontWeightExample = ({
  name,
  weight,
  cssVar,
}: {
  name: string;
  weight: number;
  cssVar: string;
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(cssVar);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-muted/50">
      <div className="text-lg" style={{ fontWeight: weight }}>
        {name} - The quick brown fox jumps over the lazy dog
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">{weight}</span>
        <code
          className="cursor-pointer rounded bg-muted px-2 py-1 text-xs hover:bg-muted/80"
          onClick={handleCopy}
        >
          {cssVar}
        </code>
        {copied && <span className="text-green-500 text-xs">Copied!</span>}
      </div>
    </div>
  );
};

const LineHeightExample = ({
  name,
  value,
  cssVar,
  description,
}: {
  name: string;
  value: string;
  cssVar: string;
  description: string;
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(cssVar);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="mt-1 text-muted-foreground text-sm">{description}</p>
        </div>
        <div className="text-right">
          <code
            className="cursor-pointer rounded bg-muted px-2 py-1 text-xs hover:bg-muted/80"
            onClick={handleCopy}
          >
            {cssVar}
          </code>
          {copied && (
            <span className="ml-2 text-green-500 text-xs">Copied!</span>
          )}
        </div>
      </div>
      <div className="mb-3 text-muted-foreground text-sm">Value: {value}</div>
      <div
        className="mt-4 rounded bg-muted/50 p-4"
        style={{ lineHeight: `var(${cssVar})` }}
      >
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris.
      </div>
    </div>
  );
};

const TypographyDocumentation = () => {
  const fontSizes = [
    {
      name: 'XS',
      cssVar: '--font-size-xs',
      value: '0.75rem (12px)',
      example: 'Caption text',
      description: 'Small labels, captions',
    },
    {
      name: 'SM',
      cssVar: '--font-size-sm',
      value: '0.875rem (14px)',
      example: 'Small body text',
      description: 'Secondary text, labels',
    },
    {
      name: 'Base',
      cssVar: '--font-size-base',
      value: '1rem (16px)',
      example: 'Body text',
      description: 'Default body text',
    },
    {
      name: 'LG',
      cssVar: '--font-size-lg',
      value: '1.125rem (18px)',
      example: 'Large body text',
      description: 'Emphasized body text',
    },
    {
      name: 'XL',
      cssVar: '--font-size-xl',
      value: '1.25rem (20px)',
      example: 'Small heading',
      description: 'Small headings, large labels',
    },
    {
      name: '2XL',
      cssVar: '--font-size-2xl',
      value: '1.5rem (24px)',
      example: 'Section heading',
      description: 'H3, section headings',
    },
    {
      name: '3XL',
      cssVar: '--font-size-3xl',
      value: '1.875rem (30px)',
      example: 'Page section',
      description: 'H2, major sections',
    },
    {
      name: '4XL',
      cssVar: '--font-size-4xl',
      value: '2.25rem (36px)',
      example: 'Page title',
      description: 'H1, page titles',
    },
    {
      name: '5XL',
      cssVar: '--font-size-5xl',
      value: '3rem (48px)',
      example: 'Display',
      description: 'Large display text',
    },
    {
      name: '6XL',
      cssVar: '--font-size-6xl',
      value: '3.75rem (60px)',
      example: 'Hero',
      description: 'Hero sections',
    },
    {
      name: '7XL',
      cssVar: '--font-size-7xl',
      value: '4.5rem (72px)',
      example: 'Banner',
      description: 'Extra large displays',
    },
  ];

  const fontWeights = [
    { name: 'Thin', weight: 100, cssVar: '--font-weight-thin' },
    { name: 'Light', weight: 300, cssVar: '--font-weight-light' },
    { name: 'Normal', weight: 400, cssVar: '--font-weight-normal' },
    { name: 'Medium', weight: 500, cssVar: '--font-weight-medium' },
    { name: 'Semibold', weight: 600, cssVar: '--font-weight-semibold' },
    { name: 'Bold', weight: 700, cssVar: '--font-weight-bold' },
    { name: 'Black', weight: 900, cssVar: '--font-weight-black' },
  ];

  const lineHeights = [
    {
      name: 'None',
      value: '1',
      cssVar: '--line-height-none',
      description: 'No extra line height',
    },
    {
      name: 'Tight',
      value: '1.25',
      cssVar: '--line-height-tight',
      description: 'Tight line spacing for headings',
    },
    {
      name: 'Snug',
      value: '1.375',
      cssVar: '--line-height-snug',
      description: 'Slightly tight spacing',
    },
    {
      name: 'Normal',
      value: '1.5',
      cssVar: '--line-height-normal',
      description: 'Default line spacing',
    },
    {
      name: 'Relaxed',
      value: '1.625',
      cssVar: '--line-height-relaxed',
      description: 'Relaxed spacing for readability',
    },
    {
      name: 'Loose',
      value: '2',
      cssVar: '--line-height-loose',
      description: 'Extra spacing for emphasis',
    },
  ];

  const letterSpacings = [
    { name: 'Tighter', value: '-0.05em', cssVar: '--letter-spacing-tighter' },
    { name: 'Tight', value: '-0.025em', cssVar: '--letter-spacing-tight' },
    { name: 'Normal', value: '0', cssVar: '--letter-spacing-normal' },
    { name: 'Wide', value: '0.025em', cssVar: '--letter-spacing-wide' },
    { name: 'Wider', value: '0.05em', cssVar: '--letter-spacing-wider' },
    { name: 'Widest', value: '0.1em', cssVar: '--letter-spacing-widest' },
  ];

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-12">
        <h1 className="mb-4 font-bold text-4xl">Typography System</h1>
        <p className="mb-6 text-lg text-muted-foreground">
          Our typography system provides a consistent and harmonious type scale
          based on a modular scale with a 1.25 ratio. We use Geist Sans for UI
          text and Geist Mono for code.
        </p>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-muted/50 p-6">
            <h2 className="mb-3 font-semibold text-xl">Font Families</h2>
            <div className="space-y-3">
              <div>
                <div className="mb-1 font-sans text-lg">Geist Sans</div>
                <code className="rounded bg-muted px-2 py-1 text-xs">
                  --font-sans
                </code>
                <p className="mt-1 text-muted-foreground text-sm">
                  Primary font for all UI text
                </p>
              </div>
              <div>
                <div className="mb-1 font-mono text-lg">Geist Mono</div>
                <code className="rounded bg-muted px-2 py-1 text-xs">
                  --font-mono
                </code>
                <p className="mt-1 text-muted-foreground text-sm">
                  Monospace font for code and technical content
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-6">
            <h2 className="mb-3 font-semibold text-xl">Type Scale</h2>
            <p className="mb-3 text-sm">
              Our type scale follows a modular scale with a ratio of 1.25,
              creating harmonious size relationships.
            </p>
            <div className="space-y-1 text-sm">
              <div>Base: 16px (1rem)</div>
              <div>Ratio: 1.25</div>
              <div>Scale: 12px → 72px</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="mb-6 font-semibold text-2xl">Font Sizes</h2>
        <div className="grid grid-cols-1 gap-4">
          {fontSizes.map((size) => (
            <TypographyToken key={size.cssVar} {...size} />
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="mb-6 font-semibold text-2xl">Font Weights</h2>
        <div className="overflow-hidden rounded-lg border border-border">
          {fontWeights.map((weight, index) => (
            <div
              className={index > 0 ? 'border-border border-t' : ''}
              key={weight.cssVar}
            >
              <FontWeightExample {...weight} />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="mb-6 font-semibold text-2xl">Line Heights</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {lineHeights.map((lineHeight) => (
            <LineHeightExample key={lineHeight.cssVar} {...lineHeight} />
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="mb-6 font-semibold text-2xl">Letter Spacing</h2>
        <div className="overflow-hidden rounded-lg border border-border">
          {letterSpacings.map((spacing, index) => (
            <div
              className={`p-4 ${index > 0 ? 'border-border border-t' : ''}`}
              key={spacing.cssVar}
            >
              <div className="flex items-center justify-between">
                <div
                  className="text-lg"
                  style={{ letterSpacing: `var(${spacing.cssVar})` }}
                >
                  {spacing.name} - The quick brown fox jumps over the lazy dog
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    {spacing.value}
                  </span>
                  <code className="rounded bg-muted px-2 py-1 text-xs">
                    {spacing.cssVar}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 rounded-lg bg-muted/50 p-6">
        <h3 className="mb-4 font-semibold text-xl">Usage Guidelines</h3>
        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-semibold">Hierarchy</h4>
            <ul className="space-y-1">
              <li>• Use size and weight to create clear hierarchy</li>
              <li>• Limit font sizes to 2-3 per component</li>
              <li>• Pair sizes with appropriate line heights</li>
              <li>• Use consistent heading scales across pages</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Readability</h4>
            <ul className="space-y-1">
              <li>• Body text: 16px minimum</li>
              <li>• Line length: 45-75 characters ideal</li>
              <li>• Line height: 1.5 for body text</li>
              <li>• Adequate contrast ratios</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Responsive Typography</h4>
            <ul className="space-y-1">
              <li>• Scale down heading sizes on mobile</li>
              <li>• Maintain readable body text size</li>
              <li>• Adjust line height for screen size</li>
              <li>• Consider touch target sizes</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Performance</h4>
            <ul className="space-y-1">
              <li>• Use system font stack fallbacks</li>
              <li>• Limit font weight variations</li>
              <li>• Preload critical fonts</li>
              <li>• Use font-display: swap</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const meta = {
  title: 'Design Tokens/Typography',
  component: TypographyDocumentation,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TypographyDocumentation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
