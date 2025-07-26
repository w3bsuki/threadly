'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/design-system/components';
import type { ProductCategory } from '../../types';

interface ProductBreadcrumbProps {
  category: ProductCategory;
  productTitle: string;
}

export function ProductBreadcrumb({ category, productTitle }: ProductBreadcrumbProps) {
  return (
    <Breadcrumb className="mb-6 hidden md:block">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {category.parent && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${category.parent.slug}`}>
                {category.parent.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        <BreadcrumbItem>
          <BreadcrumbLink href={`/${category.slug}`}>
            {category.name}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="truncate">
            {productTitle}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}