import type { ReactNode } from 'react';

type RootLayoutProperties = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
