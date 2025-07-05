'use server';

import { database } from '@repo/database';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

export interface CategoryOption {
  id: string;
  name: string;
  parentId: string | null;
  children?: CategoryOption[];
}

export async function getCategories(): Promise<CategoryOption[]> {
  try {
    const categories = await database.category.findMany({
      select: {
        id: true,
        name: true,
        parentId: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Organize into hierarchy - parent categories first
    const parentCategories = categories.filter(cat => cat.parentId === null);
    const childCategories = categories.filter(cat => cat.parentId !== null);

    const tree: CategoryOption[] = parentCategories.map(parent => ({
      ...parent,
      children: childCategories.filter(child => child.parentId === parent.id),
    }));

    return tree;
  } catch (error) {
    logError('Error fetching categories:', error);
    return [];
  }
}

export async function getCategoriesFlat(): Promise<CategoryOption[]> {
  try {
    const categories = await database.category.findMany({
      where: {
        parentId: null, // Only top-level categories for now
      },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return categories;
  } catch (error) {
    logError('Error fetching flat categories:', error);
    return [];
  }
}