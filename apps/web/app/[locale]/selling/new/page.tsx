import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
} from '@repo/ui/components';
import { logError } from '@repo/tooling/observability/server';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MultiStepWizardLazy } from './components/multi-step-wizard-lazy';

const title = 'Sell New Item';
const description = 'List your fashion item for sale on Threadly';

export const metadata: Metadata = {
  title,
  description,
};

const SellNewItemPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { locale } = await params;
  const user = await currentUser();

  try {
    // Get template and draft parameters
    const awaitedSearchParams = await searchParams;
    const _templateId =
      typeof awaitedSearchParams.template === 'string'
        ? awaitedSearchParams.template
        : undefined;
    const _draftId =
      typeof awaitedSearchParams.draft === 'string'
        ? awaitedSearchParams.draft
        : undefined;

    // If user is not authenticated, show sign-in prompt
    if (!user) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto w-full max-w-2xl text-center">
            <h1 className="mb-4 font-bold text-3xl">
              Sign In to Start Selling
            </h1>
            <p className="mb-8 text-muted-foreground">
              You need to be signed in to list items for sale.
            </p>
            <Button asChild size="lg">
              <Link
                href={`/${locale}/sign-in?from=${encodeURIComponent(`/${locale}/selling/new`)}`}
              >
                Sign In to Continue
              </Link>
            </Button>
          </div>
        </div>
      );
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
        },
      });
    }

    // Create seller profile automatically if it doesn't exist
    if (!dbUser.SellerProfile) {
      await database.sellerProfile.create({
        data: {
          userId: dbUser.id,
          displayName: `${user.firstName || 'User'}'s Shop`,
          bio: 'Selling quality fashion items',
          processingTime: 3,
          defaultShippingCost: 5.0,
          shippingFrom: 'Bulgaria', // Default, can be updated later
        },
      });
    }

    // Fetch categories
    const categories = await database.category.findMany({
      orderBy: { name: 'asc' },
    });

    // User has seller profile, show product form
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 pt-4 pb-0 sm:py-8">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link href={`/${locale}`}>
                <Button
                  className="h-8 w-8 sm:h-10 sm:w-10"
                  size="icon"
                  variant="ghost"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="font-bold text-xl sm:text-2xl">List New Item</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  <span className="hidden sm:inline">
                    Fill out the details below to list your fashion item for
                    sale
                  </span>
                  <span className="sm:hidden">List your fashion item</span>
                </p>
              </div>
            </div>

            <div className="mx-auto w-full max-w-4xl">
              <MultiStepWizardLazy
                categories={categories}
                locale={locale}
                userId={dbUser.id}
              />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    logError('Error in SellNewItemPage:', error);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto w-full max-w-2xl">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Page</AlertTitle>
            <AlertDescription>
              Unable to load the product creation page. Please try again later.
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <Button asChild>
              <Link href="/">Go Back Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
};

export default SellNewItemPage;
