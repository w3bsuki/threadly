import { redirect } from 'next/navigation';

export default function AuthenticatedPage() {
  redirect('/dashboard');
}