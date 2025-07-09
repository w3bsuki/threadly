import { redirect } from 'next/navigation';

export default function Page({ params }: { params: Promise<{ locale: string }> }) {
  redirect('/dashboard');
}