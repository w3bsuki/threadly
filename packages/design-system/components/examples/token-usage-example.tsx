import React from 'react';
import { useSafeAnimation, useTokens } from '../../hooks/use-tokens';
import { cn } from '../../lib/utils';

/**
 * Example component demonstrating how to use design tokens
 * This showcases best practices for mobile-first design
 */
export function TokenUsageExample() {
  const tokens = useTokens();
  const { getSafeDuration } = useSafeAnimation();

  return (
    <div className="space-y-8 p-6">
      <h2 className="font-bold text-2xl">Design Token Usage Examples</h2>

      {/* Touch Target Examples */}
      <section>
        <h3 className="mb-4 font-semibold text-lg">Touch Targets</h3>
        <div className="flex flex-wrap gap-4">
          <button
            className={cn(
              'flex items-center justify-center rounded-md bg-blue-500 text-white',
              tokens.tailwind.touchTargets.xs
            )}
          >
            XS (36px)
          </button>

          <button
            className={cn(
              'flex items-center justify-center rounded-md bg-blue-500 text-white',
              tokens.tailwind.touchTargets.md
            )}
          >
            MD (44px) - Recommended
          </button>

          <button
            className={cn(
              'flex items-center justify-center rounded-md bg-blue-500 text-white',
              tokens.tailwind.touchTargets.xl
            )}
          >
            XL (56px) - CTAs
          </button>
        </div>
      </section>

      {/* Safe Area Example */}
      <section>
        <h3 className="mb-4 font-semibold text-lg">Safe Area (Mobile)</h3>
        <div
          className={cn(
            'rounded-lg bg-gray-100 p-4',
            tokens.tailwind.safeArea.bottom
          )}
        >
          <p>
            This container respects safe area insets on mobile devices with
            notches/home indicators
          </p>
        </div>
      </section>

      {/* Spacing Grid Example */}
      <section>
        <h3 className="mb-4 font-semibold text-lg">8-Point Spacing Grid</h3>
        <div className="space-y-2">
          {Object.entries(tokens.spacing).map(([key, value]) => (
            <div className="flex items-center gap-4" key={key}>
              <span className="w-20 font-mono text-sm">space-{key}</span>
              <div
                className="h-4 bg-blue-500"
                style={{ width: `${value}px` }}
              />
              <span className="text-gray-500 text-sm">{value}px</span>
            </div>
          ))}
        </div>
      </section>

      {/* Animation Example */}
      <section>
        <h3 className="mb-4 font-semibold text-lg">Animations</h3>
        <div className="flex gap-4">
          <button
            className="rounded-md bg-purple-500 px-4 py-2 text-white transition-transform hover:scale-105"
            style={{
              transitionDuration: `${getSafeDuration('fast')}ms`,
              transitionTimingFunction: tokens.animations.easing.easeOut,
            }}
          >
            Fast Animation (150ms)
          </button>

          <button
            className="rounded-md bg-purple-500 px-4 py-2 text-white transition-transform hover:scale-105"
            style={{
              transitionDuration: `${getSafeDuration('normal')}ms`,
              transitionTimingFunction: tokens.animations.easing.bounce,
            }}
          >
            Bounce Animation (300ms)
          </button>
        </div>
      </section>

      {/* Thumb Reach Zone */}
      <section>
        <h3 className="mb-4 font-semibold text-lg">Thumb Reach Zone</h3>
        <div
          className={cn(
            'relative rounded-lg bg-green-100 p-4',
            tokens.tailwind.thumbReach
          )}
        >
          <p className="mb-4">
            This container is limited to 60vh height for comfortable thumb reach
            on mobile
          </p>
          <div className="absolute right-4 bottom-4 left-4">
            <button
              className={cn(
                'w-full rounded-md bg-green-500 text-white',
                tokens.tailwind.touchTargets.lg
              )}
            >
              CTA in Thumb Zone
            </button>
          </div>
        </div>
      </section>

      {/* Shadow Examples */}
      <section>
        <h3 className="mb-4 font-semibold text-lg">Elevation System</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Object.entries(tokens.shadows).map(([key, value]) => (
            <div
              className="rounded-md bg-white p-4 text-center"
              key={key}
              style={{ boxShadow: value }}
            >
              shadow-{key}
            </div>
          ))}
        </div>
      </section>

      {/* Mobile Interaction Values */}
      <section>
        <h3 className="mb-4 font-semibold text-lg">
          Mobile Interaction Values
        </h3>
        <div className="space-y-2 rounded-lg bg-gray-100 p-4">
          <p>Swipe Threshold: {tokens.mobileInteractions.swipeThreshold}px</p>
          <p>Haptic Duration: {tokens.mobileInteractions.hapticDuration}ms</p>
          <p>Tap Delay: {tokens.mobileInteractions.tapDelay}ms</p>
          <p>
            Double Tap Threshold: {tokens.mobileInteractions.doubleTapThreshold}
            ms
          </p>
        </div>
      </section>
    </div>
  );
}

/**
 * Example of a mobile-optimized product card using tokens
 */
export function MobileProductCard() {
  const tokens = useTokens();

  return (
    <div
      className="overflow-hidden rounded-lg bg-white"
      style={{
        boxShadow: tokens.shadows.md,
        borderRadius: tokens.borderRadius.lg,
      }}
    >
      {/* Image with aspect ratio */}
      <div className="aspect-square bg-gray-200" />

      {/* Content with proper spacing */}
      <div
        style={{
          padding: tokens.spacing[4],
          paddingBottom: tokens.spacing[6],
        }}
      >
        <h3
          className="font-semibold"
          style={{
            fontSize: tokens.typography.fontSize.lg,
            lineHeight: tokens.typography.lineHeight.snug,
            marginBottom: tokens.spacing[2],
          }}
        >
          Product Name
        </h3>

        <p
          className="text-gray-600"
          style={{
            fontSize: tokens.typography.fontSize.sm,
            marginBottom: tokens.spacing[4],
          }}
        >
          $29.99
        </p>

        {/* CTA with proper touch target */}
        <button
          className={cn(
            'w-full rounded-md bg-blue-500 font-medium text-white',
            tokens.tailwind.touchTargets.md
          )}
          style={{
            borderRadius: tokens.borderRadius.md,
            transition: `all ${tokens.animations.duration.fast}ms ${tokens.animations.easing.easeOut}`,
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
