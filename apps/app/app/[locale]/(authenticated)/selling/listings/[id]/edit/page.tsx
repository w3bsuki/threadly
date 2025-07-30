import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { getDictionary } from '@repo/content/internationalization';
import { decimalToNumber } from '@repo/api/utils';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Header } from '../../../../components/header';
import { EditProductForm } from './components/edit-product-form';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return {
    title: 'Edit Product',
    description: 'Update your product listing',
  };
}

interface EditProductPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

const EditProductPage = async ({ params }: EditProductPageProps) => {
  const { locale, id } = await params;
  const dictionary = await getDictionary(locale);
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Fetch the product and verify ownership
  const product = await database.product.findUnique({
    where: {
      id,
      sellerId: user.id, // Ensure user owns this product
    },
    include: {
      images: {
        orderBy: {
          displayOrder: 'asc',
        },
      },
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <>
      <Header
        dictionary={dictionary}
        page="Edit Listing"
        pages={['Dashboard', 'Selling', 'Edit Listing']}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-6">
            <h1 className="font-bold text-2xl">Edit Product Listing</h1>
            <p className="text-muted-foreground">
              Update your product details and images
            </p>
          </div>

          <EditProductForm
            product={{
              ...product,
              price: decimalToNumber(product.price),
            }}
            userId={user.id}
          />
        </div>
      </div>
    </>
  );
};

export default EditProductPage;
