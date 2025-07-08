import { currentUser } from '@repo/auth/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '../../components/header';
import { CartContent } from './components/cart-content';

const title = 'Shopping Cart';
const description = 'Review your items and checkout';

export const metadata: Metadata = {
  title,
  description,
};

const CartPage = async () => {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <>
      <Header pages={['Dashboard', 'Buying', 'Cart']} page="Cart" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Shopping Cart</h1>
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