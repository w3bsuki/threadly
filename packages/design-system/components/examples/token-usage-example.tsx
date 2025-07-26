import React from 'react';
import { useTokens, useSafeAnimation } from '../../hooks/use-tokens';
import { cn } from '../../lib/utils';

/**
 * Example component demonstrating how to use design tokens
 * This showcases best practices for mobile-first design
 */
export function TokenUsageExample() {
  const tokens = useTokens();
  const { getSafeDuration } = useSafeAnimation();

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold">Design Token Usage Examples</h2>

      {/* Touch Target Examples */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Touch Targets</h3>
        <div className="flex flex-wrap gap-4">
          <button 
            className={cn(
              "bg-blue-500 text-white rounded-md flex items-center justify-center",
              tokens.tailwind.touchTargets.xs
            )}
          >
            XS (36px)
          </button>
          
          <button 
            className={cn(
              "bg-blue-500 text-white rounded-md flex items-center justify-center",
              tokens.tailwind.touchTargets.md
            )}
          >
            MD (44px) - Recommended
          </button>
          
          <button 
            className={cn(
              "bg-blue-500 text-white rounded-md flex items-center justify-center",
              tokens.tailwind.touchTargets.xl
            )}
          >
            XL (56px) - CTAs
          </button>
        </div>
      </section>

      {/* Safe Area Example */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Safe Area (Mobile)</h3>
        <div className={cn(
          "bg-gray-100 rounded-lg p-4",
          tokens.tailwind.safeArea.bottom
        )}>
          <p>This container respects safe area insets on mobile devices with notches/home indicators</p>
        </div>
      </section>

      {/* Spacing Grid Example */}
      <section>
        <h3 className="text-lg font-semibold mb-4">8-Point Spacing Grid</h3>
        <div className="space-y-2">
          {Object.entries(tokens.spacing).map(([key, value]) => (
            <div key={key} className="flex items-center gap-4">
              <span className="text-sm font-mono w-20">space-{key}</span>
              <div 
                className="bg-blue-500 h-4"
                style={{ width: `${value}px` }}
              />
              <span className="text-sm text-gray-500">{value}px</span>
            </div>
          ))}
        </div>
      </section>

      {/* Animation Example */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Animations</h3>
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-purple-500 text-white rounded-md transition-transform hover:scale-105"
            style={{
              transitionDuration: `${getSafeDuration('fast')}ms`,
              transitionTimingFunction: tokens.animations.easing.easeOut,
            }}
          >
            Fast Animation (150ms)
          </button>
          
          <button
            className="px-4 py-2 bg-purple-500 text-white rounded-md transition-transform hover:scale-105"
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
        <h3 className="text-lg font-semibold mb-4">Thumb Reach Zone</h3>
        <div className={cn(
          "bg-green-100 rounded-lg p-4 relative",
          tokens.tailwind.thumbReach
        )}>
          <p className="mb-4">This container is limited to 60vh height for comfortable thumb reach on mobile</p>
          <div className="absolute bottom-4 left-4 right-4">
            <button className={cn(
              "w-full bg-green-500 text-white rounded-md",
              tokens.tailwind.touchTargets.lg
            )}>
              CTA in Thumb Zone
            </button>
          </div>
        </div>
      </section>

      {/* Shadow Examples */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Elevation System</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(tokens.shadows).map(([key, value]) => (
            <div
              key={key}
              className="bg-white p-4 rounded-md text-center"
              style={{ boxShadow: value }}
            >
              shadow-{key}
            </div>
          ))}
        </div>
      </section>

      {/* Mobile Interaction Values */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Mobile Interaction Values</h3>
        <div className="bg-gray-100 rounded-lg p-4 space-y-2">
          <p>Swipe Threshold: {tokens.mobileInteractions.swipeThreshold}px</p>
          <p>Haptic Duration: {tokens.mobileInteractions.hapticDuration}ms</p>
          <p>Tap Delay: {tokens.mobileInteractions.tapDelay}ms</p>
          <p>Double Tap Threshold: {tokens.mobileInteractions.doubleTapThreshold}ms</p>
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
      className="bg-white rounded-lg overflow-hidden"
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
            "w-full bg-blue-500 text-white rounded-md font-medium",
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