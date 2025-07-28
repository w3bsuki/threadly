'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CATEGORIES } from './navigation/categories';
import { useI18n } from './providers/i18n-provider';

interface ExpandableCategoryButtonProps {
  categoryName: string;
  isActive: boolean;
  onClick: () => void;
}

export const ExpandableCategoryButton = ({
  categoryName,
  isActive,
  onClick,
}: ExpandableCategoryButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { locale } = useI18n();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const category = CATEGORIES.find((cat) => cat.name === categoryName);
  if (!category) {
    return null;
  }

  const hasSubcategories = category.subcategories.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isExpanded]);

  return (
    <div className="relative flex-shrink-0 snap-start" ref={dropdownRef}>
      <div className="flex items-center gap-1">
        <button
          className={`min-h-[56px] touch-manipulation whitespace-nowrap rounded-l-full px-8 py-4 font-bold text-lg transition-all ${
            isActive
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
          }`}
          onClick={onClick}
        >
          {categoryName}
        </button>

        {hasSubcategories && (
          <button
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Hide' : 'Show'} ${categoryName} subcategories`}
            className={`min-h-[56px] touch-manipulation rounded-r-full px-3 py-4 font-bold text-lg transition-all ${
              isActive
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
            }`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {isExpanded && hasSubcategories && (
        <div className="fade-in-0 zoom-in-95 absolute top-full left-0 z-40 mt-2 min-w-[240px] animate-in rounded-lg border border-gray-200 bg-white shadow-xl duration-200">
          <div className="max-h-[60vh] overflow-y-auto p-2">
            <div className="grid grid-cols-1 gap-1">
              {category.subcategories.slice(0, 4).map((sub) => (
                <Link
                  className={`flex min-h-[44px] touch-manipulation items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors hover:bg-gray-50 ${
                    sub.popular ? 'bg-blue-50/50 font-medium' : ''
                  }`}
                  href={`/${locale}${sub.href}`}
                  key={sub.name}
                  onClick={() => setIsExpanded(false)}
                >
                  <span className="text-lg">{sub.icon}</span>
                  <span className="flex-1">{sub.name}</span>
                  {sub.popular && (
                    <span className="font-bold text-blue-600 text-xs">HOT</span>
                  )}
                </Link>
              ))}

              {category.subcategories.length > 4 && (
                <>
                  <div className="my-1 h-px bg-gray-200" />
                  <Link
                    className="flex min-h-[44px] touch-manipulation items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium text-blue-600 text-sm transition-colors hover:bg-blue-50"
                    href={`/${locale}${category.href}`}
                    onClick={() => setIsExpanded(false)}
                  >
                    View all {category.name}
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs">
                      {category.subcategories.length}
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
