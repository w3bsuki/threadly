import { redirect } from 'next/navigation';

export default function SellingPage() {
  // Redirect to new product page as the main selling page
  redirect('/selling/new');
}