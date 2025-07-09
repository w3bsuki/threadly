import { redirect } from 'next/navigation';

export default async function LocalePage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  // Redirect to the authenticated home page
  redirect(`/`);
}