import { ShoppingBag, Store, Repeat, CheckCircle } from 'lucide-react';
import { cn } from '@repo/design-system/lib/utils';
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

export function RoleSelection({ selectedRole, onSelect }: RoleSelectionProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">What brings you to Threadly?</h2>
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
              key={role.value}
              onClick={() => onSelect(role.value)}
              className={cn(
                'flex items-start p-4 rounded-[var(--radius-lg)] border-2 transition-all text-left',
                'hover:border-primary/50 hover:bg-accent/50',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-background'
              )}
            >
              <div
                className={cn(
                  'p-3 rounded-[var(--radius-full)] mr-4 transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{role.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {role.description}
                </p>
              </div>
              
              {isSelected && (
                <CheckCircle className="w-5 h-5 text-primary mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}