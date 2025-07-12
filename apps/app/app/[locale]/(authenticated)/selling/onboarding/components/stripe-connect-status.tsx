import { Badge } from '@repo/design-system/components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components';
import { CheckCircle2, AlertCircle, XCircle, Clock, Ban } from 'lucide-react';

type AccountStatus = {
  status: 'not_connected' | 'connected' | 'pending' | 'restricted' | 'disabled';
  accountId?: string;
  detailsSubmitted?: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  canAcceptPayments?: boolean;
  requirements?: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
    pendingVerification: string[];
    errors: any[];
    disabled_reason?: string;
  };
  requirementsCount?: number;
  hasPendingVerification?: boolean;
  message?: string;
};

interface StripeConnectStatusProps {
  status: AccountStatus;
  compact?: boolean;
}

export const StripeConnectStatus = ({ status, compact = false }: StripeConnectStatusProps): React.JSX.Element => {
  const getStatusConfig = () => {
    switch (status.status) {
      case 'connected':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          badge: 'default' as const,
          title: 'Connected',
          description: 'Your account is active and can accept payments',
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          badge: 'secondary' as const,
          title: 'Pending',
          description: status.hasPendingVerification 
            ? 'Account verification in progress'
            : 'Complete your account setup to start selling',
        };
      case 'restricted':
        return {
          icon: AlertCircle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          badge: 'destructive' as const,
          title: 'Restricted',
          description: 'Your account has restrictions that need to be resolved',
        };
      case 'disabled':
        return {
          icon: Ban,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          badge: 'destructive' as const,
          title: 'Disabled',
          description: 'Your account has been disabled',
        };
      case 'not_connected':
      default:
        return {
          icon: XCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          badge: 'outline' as const,
          title: 'Not Connected',
          description: 'Connect your Stripe account to start accepting payments',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${config.color}`} />
        <Badge variant={config.badge}>
          {config.title}
        </Badge>
      </div>
    );
  }

  return (
    <Card className={`${config.bgColor} ${config.borderColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${config.color}`} />
          <span className={config.color}>Account Status: {config.title}</span>
        </CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      {status.status !== 'not_connected' && (
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Account ID</p>
              <p className="text-sm font-mono">{status.accountId?.slice(0, 20)}...</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Details Submitted</p>
              <Badge variant={status.detailsSubmitted ? 'default' : 'outline'}>
                {status.detailsSubmitted ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Can Accept Payments</p>
              <Badge variant={status.canAcceptPayments ? 'default' : 'outline'}>
                {status.canAcceptPayments ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Payouts Enabled</p>
              <Badge variant={status.payoutsEnabled ? 'default' : 'outline'}>
                {status.payoutsEnabled ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>

          {status.requirements && status.requirementsCount && status.requirementsCount > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Requirements ({status.requirementsCount})
              </p>
              <div className="space-y-2">
                {status.requirements.currentlyDue.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-red-600">Currently Due:</p>
                    <ul className="text-xs text-muted-foreground list-disc list-inside">
                      {status.requirements.currentlyDue.slice(0, 3).map((req, idx) => (
                        <li key={idx}>{req.replace(/_/g, ' ')}</li>
                      ))}
                      {status.requirements.currentlyDue.length > 3 && (
                        <li>...and {status.requirements.currentlyDue.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}
                {status.requirements.pendingVerification.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-yellow-600">Pending Verification:</p>
                    <ul className="text-xs text-muted-foreground list-disc list-inside">
                      {status.requirements.pendingVerification.slice(0, 3).map((req, idx) => (
                        <li key={idx}>{req.replace(/_/g, ' ')}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};