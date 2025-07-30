import type React from 'react';

// Conditional Toolbar component
let Toolbar: React.ComponentType<any> | null = null;

try {
  const basehubModule = require('basehub/next-toolbar');
  Toolbar = basehubModule.Toolbar;
} catch (error) {}

// Fallback Toolbar component
const FallbackToolbar: React.FC<{ children?: React.ReactNode }> = () => {
  // Return null in production, only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div
      className="cms-toolbar-disabled"
      style={{
        padding: '8px',
        backgroundColor: '#f3f4f6',
        border: '1px solid #d1d5db',
        fontSize: '12px',
        color: '#6b7280',
      }}
    >
      CMS Toolbar unavailable
    </div>
  );
};

export const ToolbarComponent = Toolbar || FallbackToolbar;
export { ToolbarComponent as Toolbar };
