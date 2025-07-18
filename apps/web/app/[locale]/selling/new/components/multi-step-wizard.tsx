'use client';

import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components';
import { ArrowRight, Package, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { env } from '@/env';
import { Category } from '@repo/validation/schemas';

interface MultiStepWizardProps {
  userId: string;
  categories: Category[];
  locale: string;
}

export function MultiStepWizard({
  userId,
  categories,
  locale,
}: MultiStepWizardProps) {
  // Temporary implementation that provides a seamless redirect experience
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          Ready to Start Selling!
        </CardTitle>
        <CardDescription>
          You're all set to list your first item. We'll guide you through the
          process.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            <strong>Quick tip:</strong> Have your photos ready! Good photos help
            your items sell faster. You can upload up to 5 photos per item.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 rounded-full bg-gray-100 p-2">
              <span className="font-semibold text-sm">1</span>
            </div>
            <div>
              <h3 className="font-semibold">Upload Photos</h3>
              <p className="text-muted-foreground text-sm">
                Take clear photos from different angles
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 rounded-full bg-gray-100 p-2">
              <span className="font-semibold text-sm">2</span>
            </div>
            <div>
              <h3 className="font-semibold">Add Details</h3>
              <p className="text-muted-foreground text-sm">
                Describe your item, set price, and choose category
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 rounded-full bg-gray-100 p-2">
              <span className="font-semibold text-sm">3</span>
            </div>
            <div>
              <h3 className="font-semibold">Publish & Sell</h3>
              <p className="text-muted-foreground text-sm">
                Your item goes live instantly to thousands of buyers
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button asChild className="w-full" size="lg">
            <Link
              href={`${env.NEXT_PUBLIC_APP_URL}/${locale}/selling/new`}
              target="_blank"
            >
              <Package className="mr-2 h-5 w-5" />
              Continue to Upload Product
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="mt-2 text-center text-muted-foreground text-xs">
            Opens in seller dashboard for full upload experience
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
