import type React from 'react';

// Conditional Feed component
let Feed: React.ComponentType<any> | null = null;

try {
  const basehubModule = require('basehub/react-pump');
  Feed = basehubModule.Pump;
} catch (error) {}

// Fallback Feed component
const FallbackFeed: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="cms-disabled">
      {children || <p>CMS content not available</p>}
    </div>
  );
};

export const FeedComponent = Feed || FallbackFeed;
export { FeedComponent as Feed };
