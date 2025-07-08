import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect, notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '../../../../components/header';
import { EditProductForm } from './components/edit-product-form';

const title = 'Edit Product';
const description = 'Update your product listing';

export const metadata: Metadata = {
  title,
  description,
};

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditProductPage = async ({ params }: EditProductPageProps) => {
  const { id } = await params;
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
      <Header pages={['Dashboard', 'Selling', 'Edit Listing']} page="Edit Listing" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Edit Product Listing</h1>
            <p className="text-muted-foreground">
              Update your product details and images
            </p>
          </div>
          
          <EditProductForm product={{
            ...product,
            price: product.price.toNumber()
          }} userId={user.id} />
        </div>
      </div>
    </>
  );
};

export default EditProductPage;