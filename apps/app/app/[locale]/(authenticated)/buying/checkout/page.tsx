import { currentUser } from '@repo/auth/server';
import { getDictionary } from '@repo/internationalization';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Header } from '../../components/header';
import { CheckoutContent } from './components/checkout-content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return {
    title: 'Checkout',
    description: 'Complete your purchase',
  };
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
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
        page="Checkout"
        pages={['Dashboard', 'Buying', 'Checkout']}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-6">
            <h1 className="font-bold text-2xl">Checkout</h1>
            <p className="text-muted-foreground">
              Complete your purchase securely
            </p>
          </div>

          <CheckoutContent
            user={{
              id: user.id,
              firstName: user.firstName || undefined,
              lastName: user.lastName || undefined,
              emailAddresses: user.emailAddresses,
            }}
          />
        </div>
      </div>
    </>
  );
}
