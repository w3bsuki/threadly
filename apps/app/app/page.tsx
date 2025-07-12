import { redirect } from 'next/navigation';

export default function RootPage() {
  // The internationalization middleware will handle locale detection
  // and redirect to the appropriate locale
  redirect('/en');
}