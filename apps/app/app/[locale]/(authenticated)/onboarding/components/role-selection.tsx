import { cn } from '@repo/design-system/lib/utils';
import { CheckCircle, Repeat, ShoppingBag, Store } from 'lucide-react';
import type { UserPreferenceRole } from '@/lib/database-types';

interface RoleSelectionProps {
  selectedRole: UserPreferenceRole;
  onSelect: (role: UserPreferenceRole) => void;
}

const roles = [
  {
    value: 'BUYER' as UserPreferenceRole,
    title: 'I want to buy',
    description: 'Browse and purchase fashion items',
    icon: ShoppingBag,
  },
  {
    value: 'SELLER' as UserPreferenceRole,
    title: 'I want to sell',
    description: 'List and manage fashion items',
    icon: Store,
  },
  {
    value: 'BOTH' as UserPreferenceRole,
    title: 'I want to do both',
    description: 'Buy and sell fashion items',
    icon: Repeat,
  },
];

export function RoleSelection({
  selectedRole,
  onSelect,
}: RoleSelectionProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      <div className="mb-6 text-center">
        <h2 className="mb-2 font-semibold text-2xl">
          What brings you to Threadly?
        </h2>
        <p className="text-muted-foreground">
          Choose your primary interest (you can always change this later)
        </p>
      </div>

      <div className="grid gap-4">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.value;

          return (
            <button
              className={cn(
                'flex items-start rounded-[var(--radius-lg)] border-2 p-4 text-left transition-all',
                'hover:border-primary/50 hover:bg-accent/50',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-background'
              )}
              key={role.value}
              onClick={() => onSelect(role.value)}
            >
              <div
                className={cn(
                  'mr-4 rounded-[var(--radius-full)] p-3 transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className="h-6 w-6" />
              </div>

              <div className="flex-1">
                <h3 className="mb-1 font-semibold">{role.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {role.description}
                </p>
              </div>

              {isSelected && (
                <CheckCircle className="mt-1 h-5 w-5 text-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
