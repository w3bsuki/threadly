import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const ColorToken = ({ 
  name, 
  value, 
  cssVar,
  description 
}: { 
  name: string; 
  value: string; 
  cssVar: string;
  description?: string;
}) => {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(cssVar);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
      <div 
        className="w-16 h-16 rounded-lg border border-border shadow-sm flex-shrink-0"
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm">{name}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-1">{description}</div>
        )}
        <div className="flex items-center gap-2 mt-2">
          <code 
            className="text-xs bg-muted px-2 py-1 rounded cursor-pointer hover:bg-muted/80"
            onClick={handleCopy}
          >
            {cssVar}
          </code>
          <span className="text-xs text-muted-foreground">{value}</span>
          {copied && <span className="text-xs text-green-500">Copied!</span>}
        </div>
      </div>
    </div>
  );
};

const ColorSection = ({ 
  title, 
  tokens 
}: { 
  title: string; 
  tokens: Array<{ name: string; value: string; cssVar: string; description?: string }> 
}) => (
  <div className="mb-12">
    <h3 className="text-2xl font-semibold mb-6">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {tokens.map((token) => (
        <ColorToken key={token.cssVar} {...token} />
      ))}
    </div>
  </div>
);

const ColorsDocumentation = () => {
  const grayScale = [
    { name: 'Black', value: 'oklch(0 0 0)', cssVar: '--color-black', description: 'Pure black' },
    { name: 'Gray 50', value: 'oklch(0.985 0 0)', cssVar: '--color-gray-50', description: 'Lightest gray' },
    { name: 'Gray 100', value: 'oklch(0.97 0 0)', cssVar: '--color-gray-100' },
    { name: 'Gray 200', value: 'oklch(0.95 0 0)', cssVar: '--color-gray-200' },
    { name: 'Gray 300', value: 'oklch(0.922 0 0)', cssVar: '--color-gray-300' },
    { name: 'Gray 400', value: 'oklch(0.85 0 0)', cssVar: '--color-gray-400' },
    { name: 'Gray 500', value: 'oklch(0.708 0 0)', cssVar: '--color-gray-500', description: 'Mid gray' },
    { name: 'Gray 600', value: 'oklch(0.556 0 0)', cssVar: '--color-gray-600' },
    { name: 'Gray 700', value: 'oklch(0.439 0 0)', cssVar: '--color-gray-700' },
    { name: 'Gray 800', value: 'oklch(0.269 0 0)', cssVar: '--color-gray-800' },
    { name: 'Gray 900', value: 'oklch(0.205 0 0)', cssVar: '--color-gray-900' },
    { name: 'Gray 950', value: 'oklch(0.145 0 0)', cssVar: '--color-gray-950', description: 'Darkest gray' },
    { name: 'White', value: 'oklch(1 0 0)', cssVar: '--color-white', description: 'Pure white' },
  ];

  const functionalColors = [
    { name: 'Red 500', value: 'oklch(0.577 0.245 27.325)', cssVar: '--color-red-500', description: 'Error, destructive actions' },
    { name: 'Green 500', value: 'oklch(0.508 0.118 165.612)', cssVar: '--color-green-500', description: 'Success states' },
    { name: 'Blue 500', value: 'oklch(0.6 0.118 184.704)', cssVar: '--color-blue-500', description: 'Information, links' },
    { name: 'Yellow 500', value: 'oklch(0.828 0.189 84.429)', cssVar: '--color-yellow-500', description: 'Warnings' },
    { name: 'Purple 500', value: 'oklch(0.488 0.243 264.376)', cssVar: '--color-purple-500', description: 'Accent color' },
    { name: 'Orange 500', value: 'oklch(0.646 0.222 41.116)', cssVar: '--color-orange-500', description: 'Secondary accent' },
  ];

  const semanticColors = [
    { name: 'Background', value: 'Dynamic', cssVar: '--background', description: 'Main background color' },
    { name: 'Foreground', value: 'Dynamic', cssVar: '--foreground', description: 'Main text color' },
    { name: 'Card', value: 'Dynamic', cssVar: '--card', description: 'Card background' },
    { name: 'Card Foreground', value: 'Dynamic', cssVar: '--card-foreground', description: 'Card text color' },
    { name: 'Primary', value: 'Dynamic', cssVar: '--primary', description: 'Primary brand color' },
    { name: 'Primary Foreground', value: 'Dynamic', cssVar: '--primary-foreground', description: 'Text on primary' },
    { name: 'Secondary', value: 'Dynamic', cssVar: '--secondary', description: 'Secondary actions' },
    { name: 'Secondary Foreground', value: 'Dynamic', cssVar: '--secondary-foreground', description: 'Text on secondary' },
    { name: 'Muted', value: 'Dynamic', cssVar: '--muted', description: 'Muted backgrounds' },
    { name: 'Muted Foreground', value: 'Dynamic', cssVar: '--muted-foreground', description: 'Muted text' },
    { name: 'Accent', value: 'Dynamic', cssVar: '--accent', description: 'Accent backgrounds' },
    { name: 'Accent Foreground', value: 'Dynamic', cssVar: '--accent-foreground', description: 'Text on accent' },
  ];

  const feedbackColors = [
    { name: 'Destructive', value: 'Dynamic', cssVar: '--destructive', description: 'Destructive actions' },
    { name: 'Success', value: 'Dynamic', cssVar: '--success', description: 'Success feedback' },
    { name: 'Warning', value: 'Dynamic', cssVar: '--warning', description: 'Warning feedback' },
    { name: 'Info', value: 'Dynamic', cssVar: '--info', description: 'Informational feedback' },
  ];

  const uiColors = [
    { name: 'Border', value: 'Dynamic', cssVar: '--border', description: 'Default borders' },
    { name: 'Input', value: 'Dynamic', cssVar: '--input', description: 'Input borders' },
    { name: 'Ring', value: 'Dynamic', cssVar: '--ring', description: 'Focus rings' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Color System</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Our color system uses OKLCH (Oklab Lightness Chroma Hue) for perceptually uniform colors. 
          This ensures consistent perceived brightness across different hues.
        </p>
        
        <div className="bg-muted/50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-3">Why OKLCH?</h2>
          <ul className="space-y-2 text-sm">
            <li>• <strong>Perceptual uniformity</strong>: Colors with the same lightness value appear equally bright</li>
            <li>• <strong>Better color mixing</strong>: Interpolation between colors looks more natural</li>
            <li>• <strong>Predictable adjustments</strong>: Changing lightness doesn't affect perceived hue</li>
            <li>• <strong>Wide gamut support</strong>: Can represent colors outside sRGB</li>
          </ul>
        </div>
      </div>

      <ColorSection title="Gray Scale" tokens={grayScale} />
      <ColorSection title="Functional Colors" tokens={functionalColors} />
      <ColorSection title="Semantic Colors" tokens={semanticColors} />
      <ColorSection title="Feedback Colors" tokens={feedbackColors} />
      <ColorSection title="UI Colors" tokens={uiColors} />

      <div className="mt-12 p-6 bg-muted/50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Usage Guidelines</h3>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Semantic over Primitive</h4>
            <p>Always use semantic color tokens (e.g., <code className="bg-muted px-1">--color-primary</code>) 
            instead of primitive tokens (e.g., <code className="bg-muted px-1">--color-gray-900</code>) 
            to ensure proper theming support.</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Contrast Requirements</h4>
            <p>Ensure text meets WCAG contrast requirements:</p>
            <ul className="mt-2 space-y-1 ml-4">
              <li>• Normal text: 4.5:1 minimum contrast ratio</li>
              <li>• Large text (18pt+): 3:1 minimum contrast ratio</li>
              <li>• UI components: 3:1 minimum contrast ratio</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Dark Mode</h4>
            <p>Our semantic tokens automatically adjust for dark mode. The same token 
            (e.g., <code className="bg-muted px-1">--color-background</code>) will have 
            different values in light and dark themes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const meta = {
  title: 'Design Tokens/Colors',
  component: ColorsDocumentation,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ColorsDocumentation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};