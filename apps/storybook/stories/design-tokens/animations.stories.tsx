import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const AnimationToken = ({
  name,
  cssVar,
  value,
  description,
  demo,
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
    <div className="rounded-lg border border-border p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="mt-1 text-muted-foreground text-sm">{description}</p>
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

      <div className="mb-4 text-muted-foreground text-sm">
        Value: <code className="rounded bg-muted px-1">{value}</code>
      </div>

      {demo && (
        <div className="flex min-h-[100px] items-center justify-center rounded-lg bg-muted/30 p-6">
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
        className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
        onClick={() => {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 1000);
        }}
      >
        Click to animate
      </button>
      <div className="mt-4">
        <div
          className={`inline-block h-16 w-16 rounded-lg bg-primary ${isAnimating ? 'animate-spin' : ''}`}
          style={{
            animationDuration: `var(${duration})`,
            animationIterationCount: '1',
          }}
        />
      </div>
    </div>
  );
};

const EasingDemo = ({
  easing,
  easingVar,
}: {
  easing: string;
  easingVar: string;
}) => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  return (
    <div className="relative h-20">
      <div
        className={
          'absolute left-0 h-12 w-12 rounded-lg bg-primary transition-all'
        }
        style={{
          transform: isAnimating ? 'translateX(200px)' : 'translateX(0)',
          transitionDuration: 'var(--duration-slow)',
          transitionTimingFunction: `var(${easingVar})`,
        }}
      />
      <button
        className="absolute top-0 right-0 rounded bg-secondary px-3 py-1 text-secondary-foreground text-sm"
        onClick={() => setIsAnimating(!isAnimating)}
      >
        Toggle
      </button>
    </div>
  );
};

const KeyframeDemo = ({
  name,
  animation,
}: {
  name: string;
  animation: string;
}) => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  return (
    <div className="text-center">
      <button
        className="mb-4 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
        onClick={() => {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 600);
        }}
      >
        Play Animation
      </button>
      <div
        className={`inline-block ${isAnimating ? animation : ''}`}
        style={{
          animationDuration: '0.6s',
          animationFillMode: 'both',
        }}
      >
        <div className="flex h-32 w-32 items-center justify-center rounded-lg border border-border bg-card">
          <span className="font-medium text-sm">{name}</span>
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
          borderRadius: '50%',
        };
      default:
        return baseStyles;
    }
  };

  return (
    <div className="rounded-lg border border-border p-6">
      <h3 className="mb-4 font-semibold text-lg">Animation Playground</h3>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block font-medium text-sm">Duration</label>
          <select
            className="w-full rounded-lg border border-border bg-background p-2"
            onChange={(e) => setDuration(e.target.value)}
            value={duration}
          >
            {durations.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block font-medium text-sm">Easing</label>
          <select
            className="w-full rounded-lg border border-border bg-background p-2"
            onChange={(e) => setEasing(e.target.value)}
            value={easing}
          >
            {easings.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block font-medium text-sm">Property</label>
          <select
            className="w-full rounded-lg border border-border bg-background p-2"
            onChange={(e) => setProperty(e.target.value)}
            value={property}
          >
            {properties.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg bg-muted/30 p-8">
        <div
          className="mb-4 h-24 w-24 rounded-lg bg-primary"
          style={getAnimationStyles()}
        />
        <button
          className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
          onClick={() => setIsAnimating(!isAnimating)}
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
      demo: <DurationDemo duration="--duration-instant" />,
    },
    {
      name: 'Faster',
      cssVar: '--duration-faster',
      value: '100ms',
      description: 'Very quick micro-interactions',
      demo: <DurationDemo duration="--duration-faster" />,
    },
    {
      name: 'Fast',
      cssVar: '--duration-fast',
      value: '200ms',
      description: 'Quick transitions, hover states',
      demo: <DurationDemo duration="--duration-fast" />,
    },
    {
      name: 'Normal',
      cssVar: '--duration-normal',
      value: '300ms',
      description: 'Standard transitions, most animations',
      demo: <DurationDemo duration="--duration-normal" />,
    },
    {
      name: 'Slow',
      cssVar: '--duration-slow',
      value: '500ms',
      description: 'Deliberate animations, page transitions',
      demo: <DurationDemo duration="--duration-slow" />,
    },
    {
      name: 'Slower',
      cssVar: '--duration-slower',
      value: '700ms',
      description: 'Complex animations, staggered effects',
      demo: <DurationDemo duration="--duration-slower" />,
    },
    {
      name: 'Slowest',
      cssVar: '--duration-slowest',
      value: '1000ms',
      description: 'Major transitions, loading animations',
      demo: <DurationDemo duration="--duration-slowest" />,
    },
  ];

  const easingTokens = [
    {
      name: 'Linear',
      cssVar: '--easing-linear',
      value: 'linear',
      description: 'Constant speed, mechanical feel',
      demo: <EasingDemo easing="linear" easingVar="--easing-linear" />,
    },
    {
      name: 'Ease In',
      cssVar: '--easing-ease-in',
      value: 'cubic-bezier(0.4, 0, 1, 1)',
      description: 'Slow start, accelerates to end',
      demo: <EasingDemo easing="ease-in" easingVar="--easing-ease-in" />,
    },
    {
      name: 'Ease Out',
      cssVar: '--easing-ease-out',
      value: 'cubic-bezier(0, 0, 0.2, 1)',
      description: 'Fast start, decelerates to end (most natural)',
      demo: <EasingDemo easing="ease-out" easingVar="--easing-ease-out" />,
    },
    {
      name: 'Ease In Out',
      cssVar: '--easing-ease-in-out',
      value: 'cubic-bezier(0.4, 0, 0.2, 1)',
      description: 'Slow start and end, fast middle',
      demo: (
        <EasingDemo easing="ease-in-out" easingVar="--easing-ease-in-out" />
      ),
    },
    {
      name: 'Spring',
      cssVar: '--easing-spring',
      value: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      description: 'Overshoots slightly for playful effect',
      demo: <EasingDemo easing="spring" easingVar="--easing-spring" />,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-12">
        <h1 className="mb-4 font-bold text-4xl">Animation System</h1>
        <p className="mb-6 text-lg text-muted-foreground">
          Our animation system provides consistent motion design across the
          interface. Thoughtful animations improve usability by providing
          feedback, guiding attention, and creating smooth transitions between
          states.
        </p>

        <div className="mb-8 rounded-lg bg-muted/50 p-6">
          <h2 className="mb-3 font-semibold text-xl">Animation Principles</h2>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold">Purposeful</h3>
              <p>
                Every animation serves a specific purpose - feedback,
                orientation, or delight.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Subtle</h3>
              <p>
                Animations enhance the experience without being distracting or
                slowing tasks.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Consistent</h3>
              <p>
                Similar actions have similar animations throughout the
                interface.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Accessible</h3>
              <p>
                Respect user preferences for reduced motion and provide
                alternatives.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="mb-6 font-semibold text-2xl">Duration Tokens</h2>
        <div className="grid grid-cols-1 gap-6">
          {durationTokens.map((token) => (
            <AnimationToken key={token.cssVar} {...token} />
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="mb-6 font-semibold text-2xl">Easing Functions</h2>
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
        <h2 className="mb-6 font-semibold text-2xl">
          Common Animation Patterns
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <KeyframeDemo animation="animate-in fade-in" name="Fade In" />
          <KeyframeDemo
            animation="animate-in slide-in-from-bottom-4"
            name="Slide In"
          />
          <KeyframeDemo animation="animate-in zoom-in-95" name="Scale In" />
        </div>
      </div>

      <div className="mb-12">
        <h2 className="mb-6 font-semibold text-2xl">CSS Implementation</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border p-6">
            <h3 className="mb-3 font-semibold">Transitions</h3>
            <pre className="overflow-x-auto rounded bg-muted p-4 text-sm">
              {`.button {
  transition-property: all;
  transition-duration: var(--duration-fast);
  transition-timing-function: var(--easing-ease-out);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}`}
            </pre>
          </div>

          <div className="rounded-lg border border-border p-6">
            <h3 className="mb-3 font-semibold">Reduced Motion</h3>
            <pre className="overflow-x-auto rounded bg-muted p-4 text-sm">
              {`@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}`}
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-lg bg-muted/50 p-6">
        <h3 className="mb-4 font-semibold text-xl">Usage Guidelines</h3>
        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-semibold">Duration Guidelines</h4>
            <ul className="space-y-1">
              <li>
                • <strong>100-200ms:</strong> Hover effects, micro-interactions
              </li>
              <li>
                • <strong>200-300ms:</strong> Most transitions, state changes
              </li>
              <li>
                • <strong>300-500ms:</strong> Page transitions, complex
                animations
              </li>
              <li>
                • <strong>500ms+:</strong> Loading animations, dramatic reveals
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Easing Selection</h4>
            <ul className="space-y-1">
              <li>
                • <strong>ease-out:</strong> Most UI animations (natural
                deceleration)
              </li>
              <li>
                • <strong>ease-in:</strong> Exit animations, dismissals
              </li>
              <li>
                • <strong>ease-in-out:</strong> Continuous animations, loops
              </li>
              <li>
                • <strong>spring:</strong> Playful interactions, confirmations
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Performance Tips</h4>
            <ul className="space-y-1">
              <li>• Animate transform and opacity for best performance</li>
              <li>
                • Avoid animating layout properties (width, height, padding)
              </li>
              <li>• Use will-change sparingly for critical animations</li>
              <li>• Test on lower-end devices</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Accessibility</h4>
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
