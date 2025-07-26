'use client';

import { Card, CardContent } from '@repo/design-system/components';

interface ProductDescriptionProps {
  description: string;
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  return (
    <Card className="mt-8 border border-gray-200">
      <CardContent className="p-4 md:p-6">
        <h3 className="mb-3 font-semibold text-base">Description</h3>
        <p className="whitespace-pre-wrap text-secondary-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}