import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Modern/Design Tokens',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Modern 2025 design tokens including spacing, colors, shadows, and typography.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const SpacingScale: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-semibold text-lg">Modern Spacing Scale</h3>
        <p className="mb-6 text-muted-foreground text-sm">
          Based on a 4px grid system, optimized for 36px touch targets and
          modern compact interfaces.
        </p>
      </div>

      <div className="space-y-4">
        {[
          { var: '--space-0', value: '0px', name: '0' },
          { var: '--space-1', value: '4px', name: '1' },
          { var: '--space-2', value: '8px', name: '2' },
          { var: '--space-3', value: '12px', name: '3' },
          { var: '--space-4', value: '16px', name: '4' },
          { var: '--space-5', value: '20px', name: '5' },
          { var: '--space-6', value: '24px', name: '6' },
          { var: '--space-7', value: '28px', name: '7' },
          { var: '--space-8', value: '32px', name: '8' },
          { var: '--space-9', value: '36px', name: '9', highlight: true },
          { var: '--space-10', value: '40px', name: '10' },
          { var: '--space-11', value: '44px', name: '11' },
          { var: '--space-12', value: '48px', name: '12' },
        ].map((space) => (
          <div className="flex items-center gap-4" key={space.var}>
            <div className="w-16 font-mono text-muted-foreground text-sm">
              {space.value}
            </div>
            <div
              className={`h-8 border-primary border-l-4 bg-primary/20 ${space.highlight ? 'border-primary' : 'border-primary/60'}`}
              style={{ width: `var(${space.var})` }}
            />
            <div className="text-sm">
              <span className="font-medium">space-{space.name}</span>
              {space.highlight && (
                <span className="ml-2 text-primary text-xs">
                  (Default touch target)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const ColorPalette: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-semibold text-lg">Modern Color System</h3>
        <p className="mb-6 text-muted-foreground text-sm">
          Dark-first palette with perceptually uniform colors. Light theme
          variants included.
        </p>
      </div>

      <div className="grid gap-6">
        <div>
          <h4 className="mb-3 font-medium text-sm">Core Colors</h4>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {[
              { name: 'Background', var: '--background', text: 'foreground' },
              { name: 'Foreground', var: '--foreground', text: 'background' },
              { name: 'Primary', var: '--primary', text: 'primary-foreground' },
              {
                name: 'Secondary',
                var: '--secondary',
                text: 'secondary-foreground',
              },
              { name: 'Muted', var: '--muted', text: 'muted-foreground' },
              { name: 'Accent', var: '--accent', text: 'accent-foreground' },
              { name: 'Card', var: '--card', text: 'card-foreground' },
              { name: 'Popover', var: '--popover', text: 'popover-foreground' },
            ].map((color) => (
              <div className="space-y-2" key={color.var}>
                <div
                  className="flex h-20 items-center justify-center rounded-lg border font-medium text-sm shadow-sm"
                  style={{
                    backgroundColor: `hsl(var(${color.var}))`,
                    color: `hsl(var(--${color.text}))`,
                  }}
                >
                  {color.name}
                </div>
                <div className="font-mono text-muted-foreground text-xs">
                  {color.var}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-medium text-sm">Semantic Colors</h4>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {[
              {
                name: 'Destructive',
                var: '--destructive',
                text: 'destructive-foreground',
              },
              { name: 'Success', var: '--success', text: 'success-foreground' },
              { name: 'Warning', var: '--warning', text: 'warning-foreground' },
            ].map((color) => (
              <div className="space-y-2" key={color.var}>
                <div
                  className="flex h-20 items-center justify-center rounded-lg border font-medium text-sm shadow-sm"
                  style={{
                    backgroundColor: `hsl(var(${color.var}))`,
                    color: `hsl(var(--${color.text}))`,
                  }}
                >
                  {color.name}
                </div>
                <div className="font-mono text-muted-foreground text-xs">
                  {color.var}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-medium text-sm">UI Colors</h4>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {[
              { name: 'Border', var: '--border' },
              { name: 'Input', var: '--input' },
              { name: 'Ring', var: '--ring' },
            ].map((color) => (
              <div className="space-y-2" key={color.var}>
                <div
                  className="flex h-20 items-center justify-center rounded-lg border-2 font-medium text-sm shadow-sm"
                  style={{
                    borderColor: `hsl(var(${color.var}))`,
                    color: 'hsl(var(--foreground))',
                  }}
                >
                  {color.name}
                </div>
                <div className="font-mono text-muted-foreground text-xs">
                  {color.var}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
};

export const Shadows: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-semibold text-lg">Modern Shadow System</h3>
        <p className="mb-6 text-muted-foreground text-sm">
          Subtle, layered shadows for depth without heaviness. Includes glow
          effects for dark themes.
        </p>
      </div>

      <div className="grid gap-6">
        <div>
          <h4 className="mb-4 font-medium text-sm">Box Shadows</h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'shadow-xs', var: '--shadow-xs' },
              { name: 'shadow-sm', var: '--shadow-sm' },
              { name: 'shadow-md', var: '--shadow-md' },
              { name: 'shadow-lg', var: '--shadow-lg' },
              { name: 'shadow-xl', var: '--shadow-xl' },
              { name: 'shadow-2xl', var: '--shadow-2xl' },
            ].map((shadow) => (
              <div className="space-y-2" key={shadow.var}>
                <div
                  className="flex h-24 items-center justify-center rounded-lg border bg-card font-medium text-sm"
                  style={{ boxShadow: `var(${shadow.var})` }}
                >
                  {shadow.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-medium text-sm">
            Glow Effects (Dark Theme)
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'glow-xs', var: '--glow-xs' },
              { name: 'glow-sm', var: '--glow-sm' },
              { name: 'glow-md', var: '--glow-md' },
              { name: 'glow-lg', var: '--glow-lg' },
            ].map((glow) => (
              <div className="space-y-2" key={glow.var}>
                <div
                  className="flex h-24 items-center justify-center rounded-lg border border-primary/20 bg-card font-medium text-sm"
                  style={{ boxShadow: `var(${glow.var})` }}
                >
                  {glow.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-semibold text-lg">Modern Typography Scale</h3>
        <p className="mb-6 text-muted-foreground text-sm">
          Refined type scale with improved readability. System font stack for
          optimal performance.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          {[
            {
              size: 'text-xs',
              value: '12px',
              sample: 'The quick brown fox jumps over the lazy dog',
            },
            {
              size: 'text-sm',
              value: '14px',
              sample: 'The quick brown fox jumps over the lazy dog',
            },
            {
              size: 'text-base',
              value: '16px',
              sample: 'The quick brown fox jumps over the lazy dog',
            },
            {
              size: 'text-lg',
              value: '18px',
              sample: 'The quick brown fox jumps over the lazy dog',
            },
            {
              size: 'text-xl',
              value: '20px',
              sample: 'The quick brown fox jumps over the lazy dog',
            },
            {
              size: 'text-2xl',
              value: '24px',
              sample: 'The quick brown fox jumps',
            },
            { size: 'text-3xl', value: '30px', sample: 'The quick brown fox' },
            { size: 'text-4xl', value: '36px', sample: 'The quick brown' },
            { size: 'text-5xl', value: '48px', sample: 'The quick' },
          ].map((type) => (
            <div className="space-y-1" key={type.size}>
              <div className="flex items-baseline gap-4">
                <span className="w-16 font-mono text-muted-foreground text-xs">
                  {type.value}
                </span>
                <span className={`${type.size} font-medium`}>{type.size}</span>
              </div>
              <div className={`${type.size} text-muted-foreground`}>
                {type.sample}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-6">
          <h4 className="mb-4 font-medium text-sm">Font Stacks</h4>
          <div className="space-y-4">
            <div>
              <div className="mb-1 font-medium text-sm">Sans (Default)</div>
              <div className="font-mono text-muted-foreground text-xs">
                -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
                'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
                'Helvetica Neue', sans-serif
              </div>
            </div>
            <div>
              <div className="mb-1 font-medium text-sm">Mono</div>
              <div className="font-mono text-muted-foreground text-xs">
                ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation
                Mono', Menlo, monospace
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const BorderRadius: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-semibold text-lg">Modern Border Radius</h3>
        <p className="mb-6 text-muted-foreground text-sm">
          Smaller, more refined radii for a modern aesthetic. Default is 6px
          (radius-md).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { name: 'radius-xs', value: '2px', var: '--radius-xs' },
          { name: 'radius-sm', value: '4px', var: '--radius-sm' },
          {
            name: 'radius-md',
            value: '6px',
            var: '--radius-md',
            default: true,
          },
          { name: 'radius-lg', value: '8px', var: '--radius-lg' },
          { name: 'radius-xl', value: '12px', var: '--radius-xl' },
          { name: 'radius-2xl', value: '16px', var: '--radius-2xl' },
          { name: 'radius-3xl', value: '24px', var: '--radius-3xl' },
          { name: 'radius-full', value: '9999px', var: '--radius-full' },
        ].map((radius) => (
          <div className="space-y-2" key={radius.var}>
            <div
              className="flex h-24 items-center justify-center border border-primary/20 bg-primary/10"
              style={{ borderRadius: `var(${radius.var})` }}
            >
              <span className="font-medium text-sm">
                {radius.value}
                {radius.default && (
                  <span className="block text-primary text-xs">Default</span>
                )}
              </span>
            </div>
            <div className="text-center font-mono text-muted-foreground text-xs">
              {radius.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};
