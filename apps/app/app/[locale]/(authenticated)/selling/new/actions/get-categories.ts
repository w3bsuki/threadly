'use server';

import { CACHE_KEYS, getCacheService } from '@repo/cache';
import { database } from '@repo/database';

export interface CategoryOption {
  id: string;
  name: string;
  parentId: string | null;
  children?: CategoryOption[];
}

export async function getCategories(): Promise<CategoryOption[]> {
  const cache = getCacheService();

  return cache.remember(
    CACHE_KEYS.CATEGORIES_TREE,
    async () => {
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
        const parentCategories = categories.filter(
          (cat) => cat.parentId === null
        );
        const childCategories = categories.filter(
          (cat) => cat.parentId !== null
        );

        const tree: CategoryOption[] = parentCategories.map((parent) => ({
          ...parent,
          children: childCategories.filter(
            (child) => child.parentId === parent.id
          ),
        }));

        return tree;
      } catch (error) {
        // Return empty array on error
        return [];
      }
    },
    60 * 60, // 1 hour TTL
    ['categories']
  );
}

export async function getCategoriesFlat(): Promise<CategoryOption[]> {
  const cache = getCacheService();

  return cache.remember(
    CACHE_KEYS.CATEGORIES_FLAT,
    async () => {
      try {
        const categories = await database.category.findMany({
          select: {
            id: true,
            name: true,
            parentId: true,
          },
          orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
        });

        // Format categories with parent names for better UX
        const categoriesWithParents = categories.map((cat) => {
          if (cat.parentId) {
            const parent = categories.find((p) => p.id === cat.parentId);
            return {
              ...cat,
              name: parent ? `${parent.name} > ${cat.name}` : cat.name,
            };
          }
          return cat;
        });

        return categoriesWithParents;
      } catch (error) {
        // Return empty array on error
        return [];
      }
    },
    60 * 60, // 1 hour TTL
    ['categories']
  );
}
