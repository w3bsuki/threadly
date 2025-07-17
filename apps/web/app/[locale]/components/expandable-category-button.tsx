'use client';

import { Button } from '@repo/design-system/components';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { CATEGORIES } from './navigation/categories';
import Link from 'next/link';
import { useI18n } from './providers/i18n-provider';

interface ExpandableCategoryButtonProps {
  categoryName: string;
  isActive: boolean;
  onClick: () => void;
}

export const ExpandableCategoryButton = ({ 
  categoryName, 
  isActive, 
  onClick 
}: ExpandableCategoryButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { locale } = useI18n();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const category = CATEGORIES.find(cat => cat.name === categoryName);
  if (!category) return null;
  
  const hasSubcategories = category.subcategories.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
          onClick={onClick}
          className={`px-8 py-4 rounded-l-full text-lg font-bold transition-all touch-manipulation min-h-[56px] whitespace-nowrap ${
            isActive
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
          }`}
        >
          {categoryName}
        </button>
        
        {hasSubcategories && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-3 py-4 rounded-r-full text-lg font-bold transition-all touch-manipulation min-h-[56px] ${
              isActive
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
            }`}
            aria-label={`${isExpanded ? 'Hide' : 'Show'} ${categoryName} subcategories`}
            aria-expanded={isExpanded}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
      </div>
      
      {isExpanded && hasSubcategories && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-40 min-w-[240px] animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="p-2 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 gap-1">
              {category.subcategories.slice(0, 4).map((sub) => (
                <Link
                  key={sub.name}
                  href={`/${locale}${sub.href}`}
                  onClick={() => setIsExpanded(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                    (sub as any).popular ? 'font-medium bg-blue-50/50' : ''
                  }`}
                >
                  <span className="text-lg">{sub.icon}</span>
                  <span className="flex-1">{sub.name}</span>
                  {(sub as any).popular && <span className="text-xs text-blue-600 font-bold">HOT</span>}
                </Link>
              ))}
              
              {category.subcategories.length > 4 && (
                <>
                  <div className="h-px bg-gray-200 my-1" />
                  <Link
                    href={`/${locale}${category.href}`}
                    onClick={() => setIsExpanded(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-manipulation min-h-[44px]"
                  >
                    View all {category.name}
                    <span className="text-xs bg-blue-100 px-2 py-0.5 rounded-full">
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