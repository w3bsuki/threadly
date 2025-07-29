'use client';

import {
  animationDelays,
  animations,
  staggerAnimation,
} from '@repo/ui/lib/animations';
import { cn } from '@repo/ui/lib/utils';
import {
  forwardRef,
  type HTMLAttributes,
  useEffect,
  useRef,
  useState,
} from 'react';

interface AnimatedProps extends HTMLAttributes<HTMLDivElement> {
  animation?: keyof typeof animations;
  delay?: keyof typeof animationDelays;
  stagger?: number;
  staggerDelay?: number;
  trigger?: 'mount' | 'hover' | 'click' | 'inView';
  threshold?: number;
  once?: boolean;
  duration?: number;
}

export const Animated = forwardRef<HTMLDivElement, AnimatedProps>(
  (
    {
      children,
      className,
      animation = 'fadeIn',
      delay,
      stagger,
      staggerDelay = 50,
      trigger = 'mount',
      threshold = 0.1,
      once = true,
      duration,
      style,
      ...props
    },
    ref
  ) => {
    const [isAnimating, setIsAnimating] = useState(trigger === 'mount');
    const [hasAnimated, setHasAnimated] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    // Handle intersection observer for inView trigger
    useEffect(() => {
      if (trigger !== 'inView' || (once && hasAnimated)) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsAnimating(true);
              setHasAnimated(true);
            } else if (!once) {
              setIsAnimating(false);
            }
          });
        },
        { threshold }
      );

      const currentRef = elementRef.current;
      if (currentRef) {
        observer.observe(currentRef);
      }

      return () => {
        if (currentRef) {
          observer.unobserve(currentRef);
        }
      };
    }, [trigger, threshold, once, hasAnimated]);

    const handleClick = () => {
      if (trigger === 'click') {
        setIsAnimating(true);
        if (!once) {
          setTimeout(() => setIsAnimating(false), 1000);
        }
      }
    };

    const handleMouseEnter = () => {
      if (trigger === 'hover') {
        setIsAnimating(true);
      }
    };

    const handleMouseLeave = () => {
      if (trigger === 'hover' && !once) {
        setIsAnimating(false);
      }
    };

    const animationClass = isAnimating ? animations[animation] : '';
    const delayClass = delay ? animationDelays[delay] : '';
    const staggerStyle =
      stagger !== undefined ? staggerAnimation(stagger, staggerDelay) : {};
    const durationStyle = duration
      ? { animationDuration: `${duration}ms` }
      : {};

    return (
      <div
        className={cn(animationClass, delayClass, className)}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={ref || elementRef}
        style={{ ...style, ...staggerStyle, ...durationStyle }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Animated.displayName = 'Animated';

// Stagger container for animating lists
interface StaggerContainerProps extends HTMLAttributes<HTMLDivElement> {
  staggerDelay?: number;
  animation?: keyof typeof animations;
  trigger?: 'mount' | 'inView';
  threshold?: number;
}

export const StaggerContainer = forwardRef<
  HTMLDivElement,
  StaggerContainerProps
>(
  (
    {
      children,
      staggerDelay = 50,
      animation = 'fadeInUp',
      trigger = 'mount',
      threshold = 0.1,
      className,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(trigger === 'mount');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (trigger !== 'inView') return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
            }
          });
        },
        { threshold }
      );

      const currentRef = containerRef.current;
      if (currentRef) {
        observer.observe(currentRef);
      }

      return () => {
        if (currentRef) {
          observer.unobserve(currentRef);
        }
      };
    }, [trigger, threshold]);

    return (
      <div className={className} ref={ref || containerRef} {...props}>
        {Array.isArray(children)
          ? children.map((child, index) => (
              <Animated
                animation={animation}
                className={isVisible ? '' : 'opacity-0'}
                key={index}
                stagger={index}
                staggerDelay={staggerDelay}
                trigger="mount"
              >
                {child}
              </Animated>
            ))
          : children}
      </div>
    );
  }
);

StaggerContainer.displayName = 'StaggerContainer';

// Page transition wrapper
interface PageTransitionProps extends HTMLAttributes<HTMLDivElement> {
  animation?:
    | 'fade'
    | 'slideUp'
    | 'slideDown'
    | 'slideLeft'
    | 'slideRight'
    | 'zoom';
}

export const PageTransition = forwardRef<HTMLDivElement, PageTransitionProps>(
  ({ children, animation = 'fade', className, ...props }, ref) => {
    const animationMap = {
      fade: 'fadeIn',
      slideUp: 'fadeInUp',
      slideDown: 'fadeInDown',
      slideLeft: 'fadeInLeft',
      slideRight: 'fadeInRight',
      zoom: 'zoomIn',
    } as const;

    return (
      <Animated
        animation={animationMap[animation]}
        className={className}
        ref={ref}
        trigger="mount"
        {...props}
      >
        {children}
      </Animated>
    );
  }
);

PageTransition.displayName = 'PageTransition';

// Hover card animation wrapper
export const HoverCard = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  return (
    <div
      className={cn(
        'transition-all duration-300',
        'hover:scale-[1.02] hover:shadow-lg',
        'active:scale-[0.98]',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

HoverCard.displayName = 'HoverCard';
