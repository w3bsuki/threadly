import { Toolbar } from '@repo/cms/components/toolbar';

export default async function LegalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  await params; // Await the params even if not used, as per Next.js 15 requirement
  
  return (
    <>
      {children}
      <Toolbar />
    </>
  );
}
