import { Button } from '@repo/design-system/components';
import Link from 'next/link';

interface Category {
  name: string;
  href: string;
  icon: string;
  subcategories: Array<{
    name: string;
    href: string;
    icon: string;
    popular?: boolean;
  }>;
}

interface CategoryMenuProps {
  categories: Category[];
  expandedCategories: string[];
  onToggleExpansion: (categoryName: string) => void;
  onClose: () => void;
  variant: 'desktop' | 'mobile';
}

export function CategoryMenu({
  categories,
  expandedCategories,
  onToggleExpansion,
  onClose,
  variant,
}: CategoryMenuProps) {
  if (variant === 'desktop') {
    return (
      <div
        aria-label="Product categories"
        className="absolute top-full left-0 z-50 mt-1 w-[520px] rounded-lg border border-gray-200 bg-white shadow-lg"
        id="categories-menu"
        role="menu"
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="p-4">
            <p className="mb-3 font-medium text-gray-500 text-xs uppercase tracking-wider">
              Categories
            </p>
            <div className="space-y-1">
              {categories.map((category) => (
                <div
                  className="overflow-hidden rounded-lg border border-gray-100"
                  key={category.name}
                >
                  <div className="flex items-center">
                    <Link
                      className="group flex flex-1 items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-gray-50"
                      href={category.href}
                      onClick={onClose}
                      role="menuitem"
                    >
                      <span className="text-lg opacity-70 group-hover:opacity-100">
                        {category.icon}
                      </span>
                      <span className="font-medium text-gray-700 text-sm group-hover:text-black">
                        {category.name}
                      </span>
                    </Link>

                    {category.subcategories.length > 0 && (
                      <button
                        aria-expanded={expandedCategories.includes(
                          category.name
                        )}
                        aria-label={`${expandedCategories.includes(category.name) ? 'Hide' : 'Show'} ${category.name} subcategories`}
                        className="border-gray-100 border-l px-3 py-2.5 font-medium text-gray-500 text-xs hover:bg-gray-50 hover:text-gray-700"
                        onClick={() => onToggleExpansion(category.name)}
                      >
                        {expandedCategories.includes(category.name)
                          ? 'Less'
                          : 'More'}
                      </button>
                    )}
                  </div>

                  {expandedCategories.includes(category.name) &&
                    category.subcategories.length > 0 && (
                      <div className="border-gray-100 border-t bg-gray-50">
                        <div className="grid grid-cols-2 gap-px bg-gray-200 p-2">
                          {category.subcategories.map((sub) => (
                            <Link
                              aria-label={`Browse ${sub.name} in ${category.name}${sub.popular ? ' - Popular' : ''}`}
                              className={`flex items-center gap-2 rounded bg-white px-3 py-2 transition-colors hover:bg-gray-50 ${
                                sub.popular ? 'ring-1 ring-blue-200' : ''
                              }`}
                              href={sub.href}
                              key={sub.name}
                              onClick={onClose}
                              role="menuitem"
                            >
                              <span aria-hidden="true" className="text-sm">
                                {sub.icon}
                              </span>
                              <span className="font-medium text-gray-700 text-sm">
                                {sub.name}
                              </span>
                              {sub.popular && (
                                <span
                                  aria-label="Popular"
                                  className="text-blue-600 text-xs"
                                >
                                  •
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-gray-100 border-t p-3">
          <Link
            className="flex-1 rounded-lg bg-black px-3 py-2 text-center font-medium text-sm text-white transition-colors hover:bg-gray-800"
            href="/products?condition=NEW_WITH_TAGS"
            onClick={onClose}
            role="menuitem"
          >
            NEW
          </Link>
          <Link
            className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-center font-medium text-sm text-white transition-colors hover:bg-red-600"
            href="/products?sale=true"
            onClick={onClose}
            role="menuitem"
          >
            SALE
          </Link>
          <Link
            className="flex-1 rounded-lg bg-orange-500 px-3 py-2 text-center font-medium text-sm text-white transition-colors hover:bg-orange-600"
            href="/products?sort=popular"
            onClick={onClose}
            role="menuitem"
          >
            HOT
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="mb-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
        Shop by Category
      </h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <div
            className="overflow-hidden rounded-xl border border-gray-200"
            key={category.name}
          >
            <div className="flex min-h-[44px] items-center">
              <Link
                aria-label={`Browse ${category.name} category`}
                className="flex flex-1 items-center gap-3 p-4 transition-colors hover:bg-gray-50 active:scale-95"
                href={category.href}
                onClick={onClose}
              >
                <span aria-hidden="true" className="text-2xl">
                  {category.icon}
                </span>
                <span className="font-medium text-gray-900">
                  {category.name}
                </span>
              </Link>

              {category.subcategories.length > 0 && (
                <Button
                  aria-expanded={expandedCategories.includes(category.name)}
                  aria-label={`${expandedCategories.includes(category.name) ? 'Hide' : 'Show'} ${category.name} subcategories`}
                  className="m-2 h-10 min-w-[44px] px-3 font-medium text-gray-600 text-xs hover:text-gray-900"
                  onClick={() => onToggleExpansion(category.name)}
                  size="sm"
                  variant="ghost"
                >
                  {expandedCategories.includes(category.name) ? 'Less' : 'More'}
                </Button>
              )}
            </div>

            {expandedCategories.includes(category.name) &&
              category.subcategories.length > 0 && (
                <div className="border-gray-200 border-t bg-gray-50">
                  <div className="grid grid-cols-2 gap-px bg-gray-200 p-2">
                    {category.subcategories.map((sub) => (
                      <Link
                        aria-label={`Browse ${sub.name} in ${category.name}${sub.popular ? ' - Popular' : ''}`}
                        className={`flex min-h-[44px] items-center gap-2 rounded bg-white p-3 transition-colors hover:bg-gray-50 active:scale-95 ${
                          sub.popular ? 'ring-1 ring-blue-200' : ''
                        }`}
                        href={sub.href}
                        key={sub.name}
                        onClick={onClose}
                      >
                        <span aria-hidden="true" className="text-lg">
                          {sub.icon}
                        </span>
                        <span className="font-medium text-gray-700 text-sm">
                          {sub.name}
                        </span>
                        {sub.popular && (
                          <span
                            aria-label="Popular"
                            className="text-blue-600 text-xs"
                          >
                            •
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
