import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const SpacingToken = ({
  name,
  cssVar,
  value,
  pixels
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
    <div className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-shrink-0">
        <div 
          className="bg-primary rounded"
          style={{ 
            width: `var(${cssVar})`,
            height: `var(${cssVar})`,
            minWidth: '4px',
            minHeight: '4px'
          }}
        />
      </div>
      <div className="flex-1 grid grid-cols-4 gap-4 items-center text-sm">
        <div className="font-semibold">{name}</div>
        <code 
          className="bg-muted px-2 py-1 rounded cursor-pointer hover:bg-muted/80 text-xs"
          onClick={handleCopy}
        >
          {cssVar}
        </code>
        <div className="text-muted-foreground">{value}</div>
        <div className="text-muted-foreground">{pixels}</div>
      </div>
      {copied && <span className="text-xs text-green-500">Copied!</span>}
    </div>
  );
};

const SpacingExample = ({
  title,
  description,
  spaces
}: {
  title: string;
  description: string;
  spaces: string[];
}) => {
  return (
    <div className="border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <div className="flex flex-wrap gap-2">
        {spaces.map((space) => (
          <div 
            key={space}
            className="bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center text-xs font-mono"
            style={{ 
              width: `var(${space})`,
              height: `var(${space})`,
              minWidth: '24px',
              minHeight: '24px'
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
    <div className="border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Interactive Spacing Visualizer</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Select spacing value:</label>
          <select 
            className="w-full p-2 border border-border rounded-lg bg-background"
            value={selectedSpace}
            onChange={(e) => setSelectedSpace(e.target.value)}
          >
            {Array.from({ length: 21 }, (_, i) => {
              const num = i === 0 ? 0 : i === 1 ? 1 : i === 2 ? 2 : i === 3 ? 3 : 
                         i === 4 ? 4 : i === 5 ? 5 : i === 6 ? 6 : i === 7 ? 7 : 
                         i === 8 ? 8 : i === 9 ? 9 : i === 10 ? 10 : i === 11 ? 12 : 
                         i === 12 ? 14 : i === 13 ? 16 : i === 14 ? 20 : i === 15 ? 24 : 
                         i === 16 ? 32 : i === 17 ? 40 : i === 18 ? 48 : i === 19 ? 56 : 64;
              return (
                <option key={num} value={`--space-${num}`}>
                  space-{num}
                </option>
              );
            })}
          </select>
        </div>
        
        <div>
          <div className="text-sm font-medium mb-2">Examples:</div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Padding:</span>
              <div 
                className="bg-primary/10 border border-primary/30 rounded"
                style={{ padding: `var(${selectedSpace})` }}
              >
                <div className="bg-primary/20 rounded px-3 py-1 text-xs">Content</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Margin:</span>
              <div className="bg-muted rounded p-2">
                <div 
                  className="bg-primary/20 rounded px-3 py-1 text-xs"
                  style={{ margin: `var(${selectedSpace})` }}
                >
                  Content
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Gap:</span>
              <div 
                className="flex bg-muted rounded p-2"
                style={{ gap: `var(${selectedSpace})` }}
              >
                <div className="bg-primary/20 rounded px-3 py-1 text-xs">Item 1</div>
                <div className="bg-primary/20 rounded px-3 py-1 text-xs">Item 2</div>
                <div className="bg-primary/20 rounded px-3 py-1 text-xs">Item 3</div>
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
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Spacing System</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Our spacing system is based on a 4px grid, providing consistent and harmonious spacing 
          throughout the interface. This creates visual rhythm and improves scannability.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-muted/50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">4px Grid System</h2>
            <p className="text-sm">
              All spacing values are multiples of 4px, ensuring consistent alignment and 
              proportional relationships between elements.
            </p>
          </div>
          
          <div className="bg-muted/50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Rem-based Values</h2>
            <p className="text-sm">
              Spacing uses rem units for accessibility, allowing users to scale the interface 
              with browser zoom while maintaining proportions.
            </p>
          </div>
          
          <div className="bg-muted/50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Consistent Scale</h2>
            <p className="text-sm">
              The scale provides enough options for flexibility while preventing arbitrary 
              spacing values that could break visual consistency.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Spacing Scale</h2>
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-4 px-4 text-sm font-medium text-muted-foreground">
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
        <h2 className="text-2xl font-semibold mb-6">Common Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SpacingExample
            title="Component Padding"
            description="Internal spacing within components"
            spaces={['--space-2', '--space-3', '--space-4', '--space-6', '--space-8']}
          />
          
          <SpacingExample
            title="Layout Gaps"
            description="Space between layout elements"
            spaces={['--space-4', '--space-6', '--space-8', '--space-12', '--space-16']}
          />
          
          <SpacingExample
            title="Section Spacing"
            description="Vertical rhythm between sections"
            spaces={['--space-16', '--space-20', '--space-24', '--space-32']}
          />
          
          <SpacingExample
            title="Micro Spacing"
            description="Small gaps and adjustments"
            spaces={['--space-1', '--space-2', '--space-3', '--space-4']}
          />
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Spacing in Practice</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Card Component</h3>
            <div className="bg-card border border-border rounded-lg" style={{ padding: 'var(--space-6)' }}>
              <h4 className="text-lg font-semibold" style={{ marginBottom: 'var(--space-2)' }}>
                Card Title
              </h4>
              <p className="text-muted-foreground" style={{ marginBottom: 'var(--space-4)' }}>
                This card demonstrates consistent spacing using our token system.
              </p>
              <div className="flex" style={{ gap: 'var(--space-3)' }}>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded">
                  Action
                </button>
                <button className="px-4 py-2 border border-border rounded">
                  Cancel
                </button>
              </div>
            </div>
          </div>
          
          <div className="border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Form Layout</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium" style={{ marginBottom: 'var(--space-2)', display: 'block' }}>
                  Name
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-input rounded-lg"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="text-sm font-medium" style={{ marginBottom: 'var(--space-2)', display: 'block' }}>
                  Email
                </label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border border-input rounded-lg"
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 p-6 bg-muted/50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Usage Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Consistency</h4>
            <ul className="space-y-1">
              <li>• Always use spacing tokens, never arbitrary values</li>
              <li>• Use the same spacing for similar contexts</li>
              <li>• Maintain consistent vertical rhythm</li>
              <li>• Group related elements with smaller spacing</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Hierarchy</h4>
            <ul className="space-y-1">
              <li>• More space creates stronger separation</li>
              <li>• Use larger spacing between major sections</li>
              <li>• Use smaller spacing within components</li>
              <li>• White space helps guide the eye</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Responsive Spacing</h4>
            <ul className="space-y-1">
              <li>• Consider reducing spacing on mobile</li>
              <li>• Maintain touch target sizes (44px min)</li>
              <li>• Test spacing at different zoom levels</li>
              <li>• Use CSS clamp() for fluid spacing when needed</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Common Patterns</h4>
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