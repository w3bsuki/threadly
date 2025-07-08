import { redirect } from 'next/navigation';

export default function BuyingPage() {
  // Redirect to favorites as the main buying page
  redirect('/buying/favorites');
}