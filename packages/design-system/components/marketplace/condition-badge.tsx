import { Badge } from '../ui/badge';
import { cn } from '@repo/design-system/lib/utils';

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
}

const conditionConfig = {
  NEW_WITH_TAGS: {
    label: 'New',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  },
  NEW_WITHOUT_TAGS: {
    label: 'New',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
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
    className: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
  },
  FAIR: {
    label: 'Fair',
    className: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
  },
};

export function ConditionBadge({ condition, className }: ConditionBadgeProps) {
  const config = conditionConfig[condition];
  
  if (!config) {
    return (
      <Badge variant="secondary" className={cn('text-xs', className)}>
        {condition}
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'text-xs font-medium transition-colors',
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}