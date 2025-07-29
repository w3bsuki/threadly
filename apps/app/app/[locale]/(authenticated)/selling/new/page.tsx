import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
} from '@repo/ui/components';
import { log, logError } from '@repo/observability/server';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MultiStepWizard } from './components/multi-step-wizard';

const title = 'Sell New Item';
const description = 'List your fashion item for sale on Threadly';

export const metadata: Metadata = {
  title,
  description,
};

const SellNewItemPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  try {
    // Get template and draft parameters
    const awaitedSearchParams = await searchParams;
    const templateId =
      typeof awaitedSearchParams.template === 'string'
        ? awaitedSearchParams.template
        : undefined;
    const draftId =
      typeof awaitedSearchParams.draft === 'string'
        ? awaitedSearchParams.draft
        : undefined;

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

    // Seller profile is required to list items
    // This ensures we have shipping and payout information
    if (!dbUser.SellerProfile) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button size="icon" variant="ghost">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-2xl">List New Item</h1>
              <p className="text-muted-foreground">
                Get ready to sell your fashion items
              </p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-2xl">
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Seller Profile Required</AlertTitle>
              <AlertDescription>
                You need to complete your seller profile before you can list
                items for sale. This includes your payment information and
                shipping settings.
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <Button asChild>
                <Link href="/selling/onboarding">Set Up Seller Account</Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Fetch template data, draft, and categories
    const [selectedTemplate, draftProduct, templates, categories] =
      await Promise.all([
        // Template feature disabled
        null,
        null,
        // Templates feature disabled
        Promise.resolve([]),
        database.category.findMany({
          orderBy: { name: 'asc' },
        }),
      ]);

    // User has seller profile, show product form
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button size="icon" variant="ghost">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-2xl">List New Item</h1>
            <p className="text-muted-foreground">
              Fill out the details below to list your fashion item for sale
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-4xl">
          <MultiStepWizard
            categories={categories}
            draftProduct={draftProduct || undefined}
            selectedTemplate={selectedTemplate || undefined}
            templates={templates}
            userId={dbUser.id}
          />
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
            <pre className="mt-2 whitespace-pre-wrap text-xs">
              {error instanceof Error
                ? error.message
                : JSON.stringify(error, null, 2)}
            </pre>
          </AlertDescription>
        </Alert>

        <div className="text-center">
          <Button asChild>
            <Link href="/">Go Back Home</Link>
          </Button>
        </div>
      </div>
    );
  }
};

export default SellNewItemPage;
