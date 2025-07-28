import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const SpacingToken = ({
  name,
  cssVar,
  value,
  pixels,
}: {
  name: string;
  cssVar: string;
  value: string;
  pixels: string;
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(cssVar);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
      <div className="flex-shrink-0">
        <div
          className="rounded bg-primary"
          style={{
            width: `var(${cssVar})`,
            height: `var(${cssVar})`,
            minWidth: '4px',
            minHeight: '4px',
          }}
        />
      </div>
      <div className="grid flex-1 grid-cols-4 items-center gap-4 text-sm">
        <div className="font-semibold">{name}</div>
        <code
          className="cursor-pointer rounded bg-muted px-2 py-1 text-xs hover:bg-muted/80"
          onClick={handleCopy}
        >
          {cssVar}
        </code>
        <div className="text-muted-foreground">{value}</div>
        <div className="text-muted-foreground">{pixels}</div>
      </div>
      {copied && <span className="text-green-500 text-xs">Copied!</span>}
    </div>
  );
};

const SpacingExample = ({
  title,
  description,
  spaces,
}: {
  title: string;
  description: string;
  spaces: string[];
}) => {
  return (
    <div className="rounded-lg border border-border p-6">
      <h3 className="mb-2 font-semibold text-lg">{title}</h3>
      <p className="mb-4 text-muted-foreground text-sm">{description}</p>
      <div className="flex flex-wrap gap-2">
        {spaces.map((space) => (
          <div
            className="flex items-center justify-center border-2 border-primary/30 border-dashed bg-primary/10 font-mono text-xs"
            key={space}
            style={{
              width: `var(${space})`,
              height: `var(${space})`,
              minWidth: '24px',
              minHeight: '24px',
            }}
          >
            {space.split('-')[2]}
          </div>
        ))}
      </div>
    </div>
  );
};

const SpacingVisualizer = () => {
  const [selectedSpace, setSelectedSpace] = React.useState('--space-4');

  return (
    <div className="rounded-lg border border-border p-6">
      <h3 className="mb-4 font-semibold text-lg">
        Interactive Spacing Visualizer
      </h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-medium text-sm">
            Select spacing value:
          </label>
          <select
            className="w-full rounded-lg border border-border bg-background p-2"
            onChange={(e) => setSelectedSpace(e.target.value)}
            value={selectedSpace}
          >
            {Array.from({ length: 21 }, (_, i) => {
              const num =
                i === 0
                  ? 0
                  : i === 1
                    ? 1
                    : i === 2
                      ? 2
                      : i === 3
                        ? 3
                        : i === 4
                          ? 4
                          : i === 5
                            ? 5
                            : i === 6
                              ? 6
                              : i === 7
                                ? 7
                                : i === 8
                                  ? 8
                                  : i === 9
                                    ? 9
                                    : i === 10
                                      ? 10
                                      : i === 11
                                        ? 12
                                        : i === 12
                                          ? 14
                                          : i === 13
                                            ? 16
                                            : i === 14
                                              ? 20
                                              : i === 15
                                                ? 24
                                                : i === 16
                                                  ? 32
                                                  : i === 17
                                                    ? 40
                                                    : i === 18
                                                      ? 48
                                                      : i === 19
                                                        ? 56
                                                        : 64;
              return (
                <option key={num} value={`--space-${num}`}>
                  space-{num}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <div className="mb-2 font-medium text-sm">Examples:</div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Padding:</span>
              <div
                className="rounded border border-primary/30 bg-primary/10"
                style={{ padding: `var(${selectedSpace})` }}
              >
                <div className="rounded bg-primary/20 px-3 py-1 text-xs">
                  Content
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Margin:</span>
              <div className="rounded bg-muted p-2">
                <div
                  className="rounded bg-primary/20 px-3 py-1 text-xs"
                  style={{ margin: `var(${selectedSpace})` }}
                >
                  Content
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Gap:</span>
              <div
                className="flex rounded bg-muted p-2"
                style={{ gap: `var(${selectedSpace})` }}
              >
                <div className="rounded bg-primary/20 px-3 py-1 text-xs">
                  Item 1
                </div>
                <div className="rounded bg-primary/20 px-3 py-1 text-xs">
                  Item 2
                </div>
                <div className="rounded bg-primary/20 px-3 py-1 text-xs">
                  Item 3
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SpacingDocumentation = () => {
  const spacingTokens = [
    { name: 'Space 0', cssVar: '--space-0', value: '0', pixels: '0px' },
    { name: 'Space 1', cssVar: '--space-1', value: '0.25rem', pixels: '4px' },
    { name: 'Space 2', cssVar: '--space-2', value: '0.5rem', pixels: '8px' },
    { name: 'Space 3', cssVar: '--space-3', value: '0.75rem', pixels: '12px' },
    { name: 'Space 4', cssVar: '--space-4', value: '1rem', pixels: '16px' },
    { name: 'Space 5', cssVar: '--space-5', value: '1.25rem', pixels: '20px' },
    { name: 'Space 6', cssVar: '--space-6', value: '1.5rem', pixels: '24px' },
    { name: 'Space 7', cssVar: '--space-7', value: '1.75rem', pixels: '28px' },
    { name: 'Space 8', cssVar: '--space-8', value: '2rem', pixels: '32px' },
    { name: 'Space 9', cssVar: '--space-9', value: '2.25rem', pixels: '36px' },
    { name: 'Space 10', cssVar: '--space-10', value: '2.5rem', pixels: '40px' },
    { name: 'Space 12', cssVar: '--space-12', value: '3rem', pixels: '48px' },
    { name: 'Space 14', cssVar: '--space-14', value: '3.5rem', pixels: '56px' },
    { name: 'Space 16', cssVar: '--space-16', value: '4rem', pixels: '64px' },
    { name: 'Space 20', cssVar: '--space-20', value: '5rem', pixels: '80px' },
    { name: 'Space 24', cssVar: '--space-24', value: '6rem', pixels: '96px' },
    { name: 'Space 32', cssVar: '--space-32', value: '8rem', pixels: '128px' },
    { name: 'Space 40', cssVar: '--space-40', value: '10rem', pixels: '160px' },
    { name: 'Space 48', cssVar: '--space-48', value: '12rem', pixels: '192px' },
    { name: 'Space 56', cssVar: '--space-56', value: '14rem', pixels: '224px' },
    { name: 'Space 64', cssVar: '--space-64', value: '16rem', pixels: '256px' },
  ];

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-12">
        <h1 className="mb-4 font-bold text-4xl">Spacing System</h1>
        <p className="mb-6 text-lg text-muted-foreground">
          Our spacing system is based on a 4px grid, providing consistent and
          harmonious spacing throughout the interface. This creates visual
          rhythm and improves scannability.
        </p>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-muted/50 p-6">
            <h2 className="mb-3 font-semibold text-xl">4px Grid System</h2>
            <p className="text-sm">
              All spacing values are multiples of 4px, ensuring consistent
              alignment and proportional relationships between elements.
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 p-6">
            <h2 className="mb-3 font-semibold text-xl">Rem-based Values</h2>
            <p className="text-sm">
              Spacing uses rem units for accessibility, allowing users to scale
              the interface with browser zoom while maintaining proportions.
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 p-6">
            <h2 className="mb-3 font-semibold text-xl">Consistent Scale</h2>
            <p className="text-sm">
              The scale provides enough options for flexibility while preventing
              arbitrary spacing values that could break visual consistency.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="mb-6 font-semibold text-2xl">Spacing Scale</h2>
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-4 px-4 font-medium text-muted-foreground text-sm">
            <div>Name</div>
            <div>Token</div>
            <div>Rem</div>
            <div>Pixels</div>
          </div>
          {spacingTokens.map((token) => (
            <SpacingToken key={token.cssVar} {...token} />
          ))}
        </div>
      </div>

      <div className="mb-12">
        <SpacingVisualizer />
      </div>

      <div className="mb-12">
        <h2 className="mb-6 font-semibold text-2xl">Common Use Cases</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <SpacingExample
            description="Internal spacing within components"
            spaces={[
              '--space-2',
              '--space-3',
              '--space-4',
              '--space-6',
              '--space-8',
            ]}
            title="Component Padding"
          />

          <SpacingExample
            description="Space between layout elements"
            spaces={[
              '--space-4',
              '--space-6',
              '--space-8',
              '--space-12',
              '--space-16',
            ]}
            title="Layout Gaps"
          />

          <SpacingExample
            description="Vertical rhythm between sections"
            spaces={['--space-16', '--space-20', '--space-24', '--space-32']}
            title="Section Spacing"
          />

          <SpacingExample
            description="Small gaps and adjustments"
            spaces={['--space-1', '--space-2', '--space-3', '--space-4']}
            title="Micro Spacing"
          />
        </div>
      </div>

      <div className="mb-12">
        <h2 className="mb-6 font-semibold text-2xl">Spacing in Practice</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border p-6">
            <h3 className="mb-4 font-semibold">Card Component</h3>
            <div
              className="rounded-lg border border-border bg-card"
              style={{ padding: 'var(--space-6)' }}
            >
              <h4
                className="font-semibold text-lg"
                style={{ marginBottom: 'var(--space-2)' }}
              >
                Card Title
              </h4>
              <p
                className="text-muted-foreground"
                style={{ marginBottom: 'var(--space-4)' }}
              >
                This card demonstrates consistent spacing using our token
                system.
              </p>
              <div className="flex" style={{ gap: 'var(--space-3)' }}>
                <button className="rounded bg-primary px-4 py-2 text-primary-foreground">
                  Action
                </button>
                <button className="rounded border border-border px-4 py-2">
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border p-6">
            <h3 className="mb-4 font-semibold">Form Layout</h3>
            <div className="space-y-4">
              <div>
                <label
                  className="font-medium text-sm"
                  style={{ marginBottom: 'var(--space-2)', display: 'block' }}
                >
                  Name
                </label>
                <input
                  className="w-full rounded-lg border border-input px-3 py-2"
                  placeholder="Enter your name"
                  type="text"
                />
              </div>
              <div>
                <label
                  className="font-medium text-sm"
                  style={{ marginBottom: 'var(--space-2)', display: 'block' }}
                >
                  Email
                </label>
                <input
                  className="w-full rounded-lg border border-input px-3 py-2"
                  placeholder="Enter your email"
                  type="email"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-lg bg-muted/50 p-6">
        <h3 className="mb-4 font-semibold text-xl">Usage Guidelines</h3>
        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-semibold">Consistency</h4>
            <ul className="space-y-1">
              <li>• Always use spacing tokens, never arbitrary values</li>
              <li>• Use the same spacing for similar contexts</li>
              <li>• Maintain consistent vertical rhythm</li>
              <li>• Group related elements with smaller spacing</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Hierarchy</h4>
            <ul className="space-y-1">
              <li>• More space creates stronger separation</li>
              <li>• Use larger spacing between major sections</li>
              <li>• Use smaller spacing within components</li>
              <li>• White space helps guide the eye</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Responsive Spacing</h4>
            <ul className="space-y-1">
              <li>• Consider reducing spacing on mobile</li>
              <li>• Maintain touch target sizes (44px min)</li>
              <li>• Test spacing at different zoom levels</li>
              <li>• Use CSS clamp() for fluid spacing when needed</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Common Patterns</h4>
            <ul className="space-y-1">
              <li>• Button padding: space-2 to space-4</li>
              <li>• Card padding: space-4 to space-6</li>
              <li>• Section margins: space-16 to space-32</li>
              <li>• Form field gaps: space-4</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const meta = {
  title: 'Design Tokens/Spacing',
  component: SpacingDocumentation,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SpacingDocumentation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
