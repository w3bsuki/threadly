import { redirect } from 'next/navigation';

export default function BuyingPage(): React.JSX.Element {
  // Redirect to favorites as the main buying page
  redirect('/buying/favorites');
}