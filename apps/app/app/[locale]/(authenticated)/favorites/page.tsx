import { redirect } from 'next/navigation';

// This is a duplicate favorites route - redirect to the proper one
const FavoritesRedirectPage = (): React.JSX.Element => {
  redirect('/buying/favorites');
};

export default FavoritesRedirectPage;