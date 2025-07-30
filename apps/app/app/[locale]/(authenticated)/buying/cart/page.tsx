import { currentUser } from '@repo/auth/server';
import { getDictionary } from '@repo/content/internationalization';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Header } from '../../components/header';
import { CartContent } from './components/cart-content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return {
    title: 'Shopping Cart',
    description: 'Review your items and checkout',
  };
}

const CartPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.JSX.Element> => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <>
      <Header
        dictionary={dictionary}
        page="Cart"
        pages={['Dashboard', 'Buying', 'Cart']}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-6">
            <h1 className="font-bold text-2xl">Shopping Cart</h1>
            <p className="text-muted-foreground">
              Review your items and proceed to checkout
            </p>
          </div>

          <CartContent userId={user.id} />
        </div>
      </div>
    </>
  );
};

export default CartPage;
