import { Toolbar } from '@repo/cms/components/toolbar';
import type { ReactNode } from 'react';

type LegalLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

const LegalLayout = async ({ children, params }: LegalLayoutProps) => {
  await params; // Await the params even if not used, as per Next.js 15 requirement
  
  return (
    <>
      {children}
      <Toolbar />
    </>
  );
};

export default LegalLayout;
