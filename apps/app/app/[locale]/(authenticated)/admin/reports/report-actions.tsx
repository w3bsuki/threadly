'use client';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components';
import { AlertTriangle, Check, Eye, MoreVertical, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { dismissReport, escalateReport, resolveReport } from './actions';

interface ReportActionsProps {
  report: {
    id: string;
    type: string;
    reason: string;
    status: string;
    product?: {
      id: string;
      title: string;
      status: string;
      seller: {
        id: string;
        firstName: string | null;
        lastName: string | null;
      };
    } | null;
    reportedUser?: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string | null;
    } | null;
  };
}

export function ReportActions({
  report,
}: ReportActionsProps): React.JSX.Element {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: () => Promise<{ success: boolean }>) => {
    setIsLoading(true);
    try {
      await action();
      router.refresh();
    } catch (error) {
      // In a real app, you'd show a toast notification here
      alert('Action failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isLoading} size="icon" variant="ghost">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={`/admin/reports/${report.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {report.status === 'PENDING' && (
          <>
            <DropdownMenuItem
              className="text-green-600"
              onClick={() =>
                handleAction(() => resolveReport(report.id, 'APPROVED'))
              }
            >
              <Check className="mr-2 h-4 w-4" />
              Approve & Take Action
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-muted-foreground"
              onClick={() => handleAction(() => dismissReport(report.id))}
            >
              <X className="mr-2 h-4 w-4" />
              Dismiss Report
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-orange-600"
              onClick={() => handleAction(() => escalateReport(report.id))}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Escalate to Admin
            </DropdownMenuItem>
          </>
        )}

        {report.status === 'UNDER_REVIEW' && (
          <>
            <DropdownMenuItem
              className="text-green-600"
              onClick={() =>
                handleAction(() => resolveReport(report.id, 'RESOLVED'))
              }
            >
              <Check className="mr-2 h-4 w-4" />
              Mark Resolved
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-muted-foreground"
              onClick={() => handleAction(() => dismissReport(report.id))}
            >
              <X className="mr-2 h-4 w-4" />
              Dismiss Report
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
