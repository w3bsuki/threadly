import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { ProductForm } from './components/product-form';
import { Alert, AlertDescription, AlertTitle } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

const title = 'Sell New Item';
const description = 'List your fashion item for sale on Threadly';

export const metadata: Metadata = {
  title,
  description,
};

const SellNewItemPage = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      redirect('/sign-in');
    }

    // Check if user exists in database, create if not
    let dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true,
        stripeAccountId: true,
        SellerProfile: true,
      },
    });

    if (!dbUser) {
      // Create user if doesn't exist
      dbUser = await database.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          imageUrl: user.imageUrl || null,
        },
        select: {
          id: true,
          stripeAccountId: true,
          SellerProfile: true,
        }
      });
    }

    // Seller profile is required to list items
    // This ensures we have shipping and payout information
    if (!dbUser.SellerProfile) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">List New Item</h1>
              <p className="text-muted-foreground">Get ready to sell your fashion items</p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-2xl">
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Seller Profile Required</AlertTitle>
              <AlertDescription>
                You need to complete your seller profile before you can list items for sale.
                This includes your payment information and shipping settings.
              </AlertDescription>
            </Alert>
            
            <div className="text-center">
              <Button asChild>
                <Link href="/selling/onboarding">
                  Set Up Seller Account
                </Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // User has seller profile, show product form
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">List New Item</h1>
            <p className="text-muted-foreground">Fill out the details below to list your fashion item for sale</p>
          </div>
        </div>
        
        <div className="mx-auto w-full max-w-2xl">
          <ProductForm userId={dbUser.id} />
        </div>
      </div>
    );
  } catch (error) {
    logError('Error in SellNewItemPage:', error);
    
    return (
      <div className="mx-auto w-full max-w-2xl p-8">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Page</AlertTitle>
          <AlertDescription>
            Unable to load the product creation page. Please try again later.
            <pre className="mt-2 text-xs whitespace-pre-wrap">
              {error instanceof Error ? error.message : JSON.stringify(error, null, 2)}
            </pre>
          </AlertDescription>
        </Alert>
        
        <div className="text-center">
          <Button asChild>
            <Link href="/">
              Go Back Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }
};

export default SellNewItemPage;