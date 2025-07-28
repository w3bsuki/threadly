import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const ShadowToken = ({
  name,
  cssVar,
  value,
  description,
}: {
  name: string;
  cssVar: string;
  value: string;
  description?: string;
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(cssVar);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{name}</h3>
          {description && (
            <p className="mt-1 text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <code
            className="cursor-pointer rounded bg-muted px-2 py-1 text-xs hover:bg-muted/80"
            onClick={handleCopy}
          >
            {cssVar}
          </code>
          {copied && <span className="text-green-500 text-xs">Copied!</span>}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-8">
        <div
          className="rounded-lg bg-card p-6 transition-shadow duration-300"
          style={{ boxShadow: `var(${cssVar})` }}
        >
          <div className="mb-2 font-medium text-sm">Shadow Example</div>
          <div className="text-muted-foreground text-xs">
            This element demonstrates the {name.toLowerCase()} shadow effect.
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded bg-muted p-3 font-mono text-muted-foreground text-xs">
        {value}
      </div>
    </div>
  );
};

const ElevationExample = () => {
  const elevations = [
    { name: 'Base', shadow: '--shadow-none', level: 0 },
    { name: 'Raised', shadow: '--shadow-sm', level: 1 },
    { name: 'Overlay', shadow: '--shadow-md', level: 2 },
    { name: 'Modal', shadow: '--shadow-lg', level: 3 },
    { name: 'Dropdown', shadow: '--shadow-xl', level: 4 },
  ];

  return (
    <div className="rounded-lg border border-border p-6">
      <h3 className="mb-4 font-semibold text-lg">Elevation Hierarchy</h3>
      <p className="mb-6 text-muted-foreground text-sm">
        Different shadow levels create a sense of depth and hierarchy in the
        interface.
      </p>

      <div className="relative h-64">
        {elevations.map((elevation, index) => (
          <div
            className="absolute rounded-lg border border-border bg-card p-4 transition-all duration-300 hover:translate-y-[-2px]"
            key={elevation.shadow}
            style={{
              boxShadow: `var(${elevation.shadow})`,
              left: `${index * 60}px`,
              top: `${index * 30}px`,
              zIndex: index,
              width: '200px',
            }}
          >
            <div className="font-medium text-sm">{elevation.name}</div>
            <div className="mt-1 text-muted-foreground text-xs">
              Level {elevation.level}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const InteractiveShadowDemo = () => {
  const [selectedShadow, setSelectedShadow] = React.useState('--shadow-md');
  const [isHovered, setIsHovered] = React.useState(false);

  const shadows = [
    { value: '--shadow-none', label: 'None' },
    { value: '--shadow-xs', label: 'XS' },
    { value: '--shadow-sm', label: 'SM' },
    { value: '--shadow-md', label: 'MD' },
    { value: '--shadow-lg', label: 'LG' },
    { value: '--shadow-xl', label: 'XL' },
    { value: '--shadow-2xl', label: '2XL' },
    { value: '--shadow-inner', label: 'Inner' },
  ];

  return (
    <div className="rounded-lg border border-border p-6">
      <h3 className="mb-4 font-semibold text-lg">Interactive Shadow Demo</h3>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-medium text-sm">
            Select shadow:
          </label>
          <select
            className="mb-4 w-full rounded-lg border border-border bg-background p-2"
            onChange={(e) => setSelectedShadow(e.target.value)}
            value={selectedShadow}
          >
            {shadows.map((shadow) => (
              <option key={shadow.value} value={shadow.value}>
                {shadow.label}
              </option>
            ))}
          </select>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                checked={isHovered}
                className="rounded"
                onChange={(e) => setIsHovered(e.target.checked)}
                type="checkbox"
              />
              Simulate hover state
            </label>
          </div>
        </div>

        <div className="flex items-center justify-center rounded-lg bg-muted/30 p-8">
          <div
            className={`rounded-lg bg-card p-6 transition-all duration-300 ${isHovered ? '-translate-y-1 transform' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              boxShadow: `var(${selectedShadow})`,
              minWidth: '200px',
            }}
          >
            <div className="mb-2 font-medium">Interactive Card</div>
            <div className="text-muted-foreground text-sm">
              Hover over this card to see the elevation change.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShadowsDocumentation = () => {
  const shadowTokens = [
    {
      name: 'Shadow None',
      cssVar: '--shadow-none',
      value: 'none',
      description: 'No shadow - flat appearance',
    },
    {
      name: 'Shadow XS',
      cssVar: '--shadow-xs',
      value: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      description: 'Subtle depth for slight elevation',
    },
    {
      name: 'Shadow SM',
      cssVar: '--shadow-sm',
      value: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      description: 'Small shadow for cards and raised elements',
    },
    {
      name: 'Shadow MD',
      cssVar: '--shadow-md',
      value: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      description: 'Medium shadow for dropdowns and overlays',
    },
    {
      name: 'Shadow LG',
      cssVar: '--shadow-lg',
      value:
        '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      description: 'Large shadow for modals and popovers',
    },
    {
      name: 'Shadow XL',
      cssVar: '--shadow-xl',
      value:
        '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      description: 'Extra large shadow for high elevation elements',
    },
    {
      name: 'Shadow 2XL',
      cssVar: '--shadow-2xl',
      value: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      description: 'Maximum elevation for special cases',
    },
    {
      name: 'Shadow Inner',
      cssVar: '--shadow-inner',
      value: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      description: 'Inner shadow for pressed or inset elements',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-12">
        <h1 className="mb-4 font-bold text-4xl">Shadow System</h1>
        <p className="mb-6 text-lg text-muted-foreground">
          Our shadow system creates depth and hierarchy in the interface.
          Shadows help establish elevation levels, indicate interactivity, and
          separate content layers.
        </p>

        <div className="mb-8 rounded-lg bg-muted/50 p-6">
          <h2 className="mb-3 font-semibold text-xl">
            Shadow Design Principles
          </h2>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold">Natural Light Source</h3>
              <p>
                Shadows simulate a consistent top-down light source, creating
                realistic depth.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Subtle & Functional</h3>
              <p>
                Shadows are subtle enough to not distract but clear enough to
                show elevation.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Consistent Elevation</h3>
              <p>
                Each shadow level represents a specific elevation in the
                interface hierarchy.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Performance Optimized</h3>
              <p>
                Shadow values are optimized for rendering performance across
                devices.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12 space-y-8">
        <h2 className="font-semibold text-2xl">Shadow Tokens</h2>
        {shadowTokens.map((token) => (
          <ShadowToken key={token.cssVar} {...token} />
        ))}
      </div>

      <div className="mb-12 space-y-8">
        <h2 className="font-semibold text-2xl">Interactive Examples</h2>
        <InteractiveShadowDemo />
        <ElevationExample />
      </div>

      <div className="mb-12">
        <h2 className="mb-6 font-semibold text-2xl">Common Use Cases</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-4">
            <h3 className="font-semibold">Cards & Containers</h3>
            <div
              className="rounded-lg border border-border bg-card p-4"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="mb-2 font-medium">Default Card</div>
              <p className="text-muted-foreground text-sm">
                Uses shadow-sm for subtle elevation
              </p>
            </div>
            <div
              className="hover:-translate-y-0.5 cursor-pointer rounded-lg border border-border bg-card p-4 transition-all"
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = 'var(--shadow-md)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')
              }
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="mb-2 font-medium">Interactive Card</div>
              <p className="text-muted-foreground text-sm">
                Hover to see elevation change
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Floating Elements</h3>
            <div className="relative h-32">
              <div
                className="absolute top-0 right-0 w-48 rounded-lg border border-border bg-card p-4"
                style={{ boxShadow: 'var(--shadow-lg)' }}
              >
                <div className="mb-2 font-medium">Dropdown Menu</div>
                <div className="space-y-1 text-sm">
                  <div>Option 1</div>
                  <div>Option 2</div>
                  <div>Option 3</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Input States</h3>
            <div className="space-y-3">
              <input
                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                placeholder="Normal input"
                type="text"
              />
              <input
                className="w-full rounded-lg border border-primary bg-background px-3 py-2"
                placeholder="Focused input (inner shadow)"
                style={{ boxShadow: 'var(--shadow-inner)' }}
                type="text"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-lg bg-muted/50 p-6">
        <h3 className="mb-4 font-semibold text-xl">Usage Guidelines</h3>
        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-semibold">Elevation Hierarchy</h4>
            <ul className="space-y-1">
              <li>
                • <strong>None:</strong> Flat elements, dividers
              </li>
              <li>
                • <strong>XS/SM:</strong> Cards, raised buttons
              </li>
              <li>
                • <strong>MD:</strong> Dropdowns, tooltips
              </li>
              <li>
                • <strong>LG/XL:</strong> Modals, dialogs
              </li>
              <li>
                • <strong>Inner:</strong> Input fields, pressed states
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Interactive States</h4>
            <ul className="space-y-1">
              <li>• Increase shadow on hover for interactive elements</li>
              <li>• Use transitions for smooth shadow changes</li>
              <li>• Combine with slight Y-axis translation</li>
              <li>• Remove shadow for disabled states</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Accessibility</h4>
            <ul className="space-y-1">
              <li>• Don't rely solely on shadows for meaning</li>
              <li>• Ensure sufficient contrast with borders</li>
              <li>• Test visibility in high contrast modes</li>
              <li>• Consider reduced motion preferences</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Performance</h4>
            <ul className="space-y-1">
              <li>• Avoid animating box-shadow directly</li>
              <li>• Use transform for elevation changes</li>
              <li>• Limit shadow use on scrollable elements</li>
              <li>• Test on lower-end devices</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const meta = {
  title: 'Design Tokens/Shadows',
  component: ShadowsDocumentation,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ShadowsDocumentation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
