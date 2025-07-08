import { redirect } from 'next/navigation';

// This is a duplicate favorites route - redirect to the proper one
const FavoritesRedirectPage = () => {
  redirect('/buying/favorites');
};

export default FavoritesRedirectPage;