import { cn } from '@repo/design-system/lib/utils';
import { Badge } from '../ui/badge';

type Condition =
  | 'NEW_WITH_TAGS'
  | 'NEW_WITHOUT_TAGS'
  | 'VERY_GOOD'
  | 'GOOD'
  | 'SATISFACTORY'
  | 'FAIR';

interface ConditionBadgeProps {
  condition: Condition;
  className?: string;
  dictionary?: {
    web?: {
      product?: {
        conditions?: {
          newWithTags?: string;
          newWithoutTags?: string;
          veryGood?: string;
          good?: string;
          fair?: string;
        };
      };
    };
  };
}

const conditionConfig = {
  NEW_WITH_TAGS: {
    label: 'New',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  },
  NEW_WITHOUT_TAGS: {
    label: 'New',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  },
  VERY_GOOD: {
    label: 'Very Good',
    className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  },
  GOOD: {
    label: 'Good',
    className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
  },
  SATISFACTORY: {
    label: 'Fair',
    className:
      'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
  },
  FAIR: {
    label: 'Fair',
    className: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
  },
};

export function ConditionBadge({
  condition,
  className,
  dictionary,
}: ConditionBadgeProps) {
  const config = conditionConfig[condition];

  if (!config) {
    return (
      <Badge className={cn('text-xs', className)} variant="secondary">
        {condition}
      </Badge>
    );
  }

  // Get translated label
  const getLabel = () => {
    switch (condition) {
      case 'NEW_WITH_TAGS':
        return (
          dictionary?.web?.product?.conditions?.newWithTags || config.label
        );
      case 'NEW_WITHOUT_TAGS':
        return (
          dictionary?.web?.product?.conditions?.newWithoutTags || config.label
        );
      case 'VERY_GOOD':
        return dictionary?.web?.product?.conditions?.veryGood || config.label;
      case 'GOOD':
        return dictionary?.web?.product?.conditions?.good || config.label;
      case 'SATISFACTORY':
      case 'FAIR':
        return dictionary?.web?.product?.conditions?.fair || config.label;
      default:
        return config.label;
    }
  };

  return (
    <Badge
      className={cn(
        'font-medium text-xs transition-colors',
        config.className,
        className
      )}
      variant="outline"
    >
      {getLabel()}
    </Badge>
  );
}
