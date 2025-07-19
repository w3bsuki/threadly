import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const AnimationToken = ({
  name,
  cssVar,
  value,
  description,
  demo
}: {
  name: string;
  cssVar: string;
  value: string;
  description: string;
  demo?: React.ReactNode;
}) => {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(cssVar);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="border border-border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <code 
            className="text-xs bg-muted px-2 py-1 rounded cursor-pointer hover:bg-muted/80"
            onClick={handleCopy}
          >
            {cssVar}
          </code>
          {copied && <span className="text-xs text-green-500">Copied!</span>}
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground mb-4">
        Value: <code className="bg-muted px-1 rounded">{value}</code>
      </div>
      
      {demo && (
        <div className="bg-muted/30 rounded-lg p-6 flex items-center justify-center min-h-[100px]">
          {demo}
        </div>
      )}
    </div>
  );
};

const DurationDemo = ({ duration }: { duration: string }) => {
  const [isAnimating, setIsAnimating] = React.useState(false);
  
  return (
    <div className="text-center">
      <button
        onClick={() => {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 1000);
        }}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
      >
        Click to animate
      </button>
      <div className="mt-4">
        <div
          className={`inline-block w-16 h-16 bg-primary rounded-lg ${isAnimating ? 'animate-spin' : ''}`}
          style={{
            animationDuration: `var(${duration})`,
            animationIterationCount: '1'
          }}
        />
      </div>
    </div>
  );
};

const EasingDemo = ({ easing, easingVar }: { easing: string; easingVar: string }) => {
  const [isAnimating, setIsAnimating] = React.useState(false);
  
  return (
    <div className="relative h-20">
      <div
        className={`absolute left-0 w-12 h-12 bg-primary rounded-lg transition-all`}
        style={{
          transform: isAnimating ? 'translateX(200px)' : 'translateX(0)',
          transitionDuration: 'var(--duration-slow)',
          transitionTimingFunction: `var(${easingVar})`
        }}
      />
      <button
        onClick={() => setIsAnimating(!isAnimating)}
        className="absolute right-0 top-0 px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded"
      >
        Toggle
      </button>
    </div>
  );
};

const KeyframeDemo = ({ 
  name, 
  animation 
}: { 
  name: string; 
  animation: string;
}) => {
  const [isAnimating, setIsAnimating] = React.useState(false);
  
  return (
    <div className="text-center">
      <button
        onClick={() => {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 600);
        }}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 mb-4"
      >
        Play Animation
      </button>
      <div 
        className={`inline-block ${isAnimating ? animation : ''}`}
        style={{
          animationDuration: '0.6s',
          animationFillMode: 'both'
        }}
      >
        <div className="w-32 h-32 bg-card border border-border rounded-lg flex items-center justify-center">
          <span className="text-sm font-medium">{name}</span>
        </div>
      </div>
    </div>
  );
};

const InteractiveAnimationDemo = () => {
  const [duration, setDuration] = React.useState('--duration-normal');
  const [easing, setEasing] = React.useState('--easing-ease-out');
  const [property, setProperty] = React.useState('transform');
  const [isAnimating, setIsAnimating] = React.useState(false);
  
  const durations = [
    { value: '--duration-instant', label: 'Instant (0ms)' },
    { value: '--duration-faster', label: 'Faster (100ms)' },
    { value: '--duration-fast', label: 'Fast (200ms)' },
    { value: '--duration-normal', label: 'Normal (300ms)' },
    { value: '--duration-slow', label: 'Slow (500ms)' },
    { value: '--duration-slower', label: 'Slower (700ms)' },
    { value: '--duration-slowest', label: 'Slowest (1000ms)' },
  ];
  
  const easings = [
    { value: '--easing-linear', label: 'Linear' },
    { value: '--easing-ease-in', label: 'Ease In' },
    { value: '--easing-ease-out', label: 'Ease Out' },
    { value: '--easing-ease-in-out', label: 'Ease In Out' },
    { value: '--easing-spring', label: 'Spring' },
  ];
  
  const properties = [
    { value: 'transform', label: 'Transform (Scale)' },
    { value: 'opacity', label: 'Opacity' },
    { value: 'all', label: 'All Properties' },
  ];
  
  const getAnimationStyles = () => {
    const baseStyles = {
      transitionProperty: property,
      transitionDuration: `var(${duration})`,
      transitionTimingFunction: `var(${easing})`,
    };
    
    if (!isAnimating) return baseStyles;
    
    switch (property) {
      case 'transform':
        return { ...baseStyles, transform: 'scale(1.5)' };
      case 'opacity':
        return { ...baseStyles, opacity: 0.3 };
      case 'all':
        return { 
          ...baseStyles, 
          transform: 'scale(1.5) rotate(180deg)', 
          opacity: 0.7,
          borderRadius: '50%'
        };
      default:
        return baseStyles;
    }
  };
  
  return (
    <div className="border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Animation Playground</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Duration</label>
          <select 
            className="w-full p-2 border border-border rounded-lg bg-background"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            {durations.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Easing</label>
          <select 
            className="w-full p-2 border border-border rounded-lg bg-background"
            value={easing}
            onChange={(e) => setEasing(e.target.value)}
          >
            {easings.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Property</label>
          <select 
            className="w-full p-2 border border-border rounded-lg bg-background"
            value={property}
            onChange={(e) => setProperty(e.target.value)}
          >
            {properties.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg">
        <div
          className="w-24 h-24 bg-primary rounded-lg mb-4"
          style={getAnimationStyles()}
        />
        <button
          onClick={() => setIsAnimating(!isAnimating)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
        >
          {isAnimating ? 'Reset' : 'Animate'}
        </button>
      </div>
    </div>
  );
};

const AnimationsDocumentation = () => {
  const durationTokens = [
    {
      name: 'Instant',
      cssVar: '--duration-instant',
      value: '0ms',
      description: 'No animation, immediate change',
      demo: <DurationDemo duration="--duration-instant" />
    },
    {
      name: 'Faster',
      cssVar: '--duration-faster',
      value: '100ms',
      description: 'Very quick micro-interactions',
      demo: <DurationDemo duration="--duration-faster" />
    },
    {
      name: 'Fast',
      cssVar: '--duration-fast',
      value: '200ms',
      description: 'Quick transitions, hover states',
      demo: <DurationDemo duration="--duration-fast" />
    },
    {
      name: 'Normal',
      cssVar: '--duration-normal',
      value: '300ms',
      description: 'Standard transitions, most animations',
      demo: <DurationDemo duration="--duration-normal" />
    },
    {
      name: 'Slow',
      cssVar: '--duration-slow',
      value: '500ms',
      description: 'Deliberate animations, page transitions',
      demo: <DurationDemo duration="--duration-slow" />
    },
    {
      name: 'Slower',
      cssVar: '--duration-slower',
      value: '700ms',
      description: 'Complex animations, staggered effects',
      demo: <DurationDemo duration="--duration-slower" />
    },
    {
      name: 'Slowest',
      cssVar: '--duration-slowest',
      value: '1000ms',
      description: 'Major transitions, loading animations',
      demo: <DurationDemo duration="--duration-slowest" />
    },
  ];

  const easingTokens = [
    {
      name: 'Linear',
      cssVar: '--easing-linear',
      value: 'linear',
      description: 'Constant speed, mechanical feel',
      demo: <EasingDemo easing="linear" easingVar="--easing-linear" />
    },
    {
      name: 'Ease In',
      cssVar: '--easing-ease-in',
      value: 'cubic-bezier(0.4, 0, 1, 1)',
      description: 'Slow start, accelerates to end',
      demo: <EasingDemo easing="ease-in" easingVar="--easing-ease-in" />
    },
    {
      name: 'Ease Out',
      cssVar: '--easing-ease-out',
      value: 'cubic-bezier(0, 0, 0.2, 1)',
      description: 'Fast start, decelerates to end (most natural)',
      demo: <EasingDemo easing="ease-out" easingVar="--easing-ease-out" />
    },
    {
      name: 'Ease In Out',
      cssVar: '--easing-ease-in-out',
      value: 'cubic-bezier(0.4, 0, 0.2, 1)',
      description: 'Slow start and end, fast middle',
      demo: <EasingDemo easing="ease-in-out" easingVar="--easing-ease-in-out" />
    },
    {
      name: 'Spring',
      cssVar: '--easing-spring',
      value: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      description: 'Overshoots slightly for playful effect',
      demo: <EasingDemo easing="spring" easingVar="--easing-spring" />
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Animation System</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Our animation system provides consistent motion design across the interface. 
          Thoughtful animations improve usability by providing feedback, guiding attention, 
          and creating smooth transitions between states.
        </p>
        
        <div className="bg-muted/50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-3">Animation Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Purposeful</h3>
              <p>Every animation serves a specific purpose - feedback, orientation, or delight.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Subtle</h3>
              <p>Animations enhance the experience without being distracting or slowing tasks.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Consistent</h3>
              <p>Similar actions have similar animations throughout the interface.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Accessible</h3>
              <p>Respect user preferences for reduced motion and provide alternatives.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Duration Tokens</h2>
        <div className="grid grid-cols-1 gap-6">
          {durationTokens.map((token) => (
            <AnimationToken key={token.cssVar} {...token} />
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Easing Functions</h2>
        <div className="grid grid-cols-1 gap-6">
          {easingTokens.map((token) => (
            <AnimationToken key={token.cssVar} {...token} />
          ))}
        </div>
      </div>

      <div className="mb-12">
        <InteractiveAnimationDemo />
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Common Animation Patterns</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KeyframeDemo name="Fade In" animation="animate-in fade-in" />
          <KeyframeDemo name="Slide In" animation="animate-in slide-in-from-bottom-4" />
          <KeyframeDemo name="Scale In" animation="animate-in zoom-in-95" />
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">CSS Implementation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-3">Transitions</h3>
            <pre className="text-sm bg-muted p-4 rounded overflow-x-auto">
{`.button {
  transition-property: all;
  transition-duration: var(--duration-fast);
  transition-timing-function: var(--easing-ease-out);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}`}</pre>
          </div>
          
          <div className="border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-3">Reduced Motion</h3>
            <pre className="text-sm bg-muted p-4 rounded overflow-x-auto">
{`@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}`}</pre>
          </div>
        </div>
      </div>

      <div className="mt-12 p-6 bg-muted/50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Usage Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Duration Guidelines</h4>
            <ul className="space-y-1">
              <li>• <strong>100-200ms:</strong> Hover effects, micro-interactions</li>
              <li>• <strong>200-300ms:</strong> Most transitions, state changes</li>
              <li>• <strong>300-500ms:</strong> Page transitions, complex animations</li>
              <li>• <strong>500ms+:</strong> Loading animations, dramatic reveals</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Easing Selection</h4>
            <ul className="space-y-1">
              <li>• <strong>ease-out:</strong> Most UI animations (natural deceleration)</li>
              <li>• <strong>ease-in:</strong> Exit animations, dismissals</li>
              <li>• <strong>ease-in-out:</strong> Continuous animations, loops</li>
              <li>• <strong>spring:</strong> Playful interactions, confirmations</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Performance Tips</h4>
            <ul className="space-y-1">
              <li>• Animate transform and opacity for best performance</li>
              <li>• Avoid animating layout properties (width, height, padding)</li>
              <li>• Use will-change sparingly for critical animations</li>
              <li>• Test on lower-end devices</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Accessibility</h4>
            <ul className="space-y-1">
              <li>• Always respect prefers-reduced-motion</li>
              <li>• Provide animation-free alternatives</li>
              <li>• Avoid flashing or strobing effects</li>
              <li>• Ensure animations don't interfere with usability</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const meta = {
  title: 'Design Tokens/Animations',
  component: AnimationsDocumentation,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AnimationsDocumentation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};