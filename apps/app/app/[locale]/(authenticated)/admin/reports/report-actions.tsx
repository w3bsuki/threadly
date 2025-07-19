'use client';

import { 
  MoreVertical, 
  Check,
  X,
  AlertTriangle,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { resolveReport, dismissReport, escalateReport } from './actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

export function ReportActions({ report }: ReportActionsProps): React.JSX.Element {
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
        <Button variant="ghost" size="icon" disabled={isLoading}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={`/admin/reports/${report.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </a>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {report.status === 'PENDING' && (
          <>
            <DropdownMenuItem
              onClick={() => handleAction(() => resolveReport(report.id, 'APPROVED'))}
              className="text-green-600"
            >
              <Check className="h-4 w-4 mr-2" />
              Approve & Take Action
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => handleAction(() => dismissReport(report.id))}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Dismiss Report
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => handleAction(() => escalateReport(report.id))}
              className="text-orange-600"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Escalate to Admin
            </DropdownMenuItem>
          </>
        )}
        
        {report.status === 'UNDER_REVIEW' && (
          <>
            <DropdownMenuItem
              onClick={() => handleAction(() => resolveReport(report.id, 'RESOLVED'))}
              className="text-green-600"
            >
              <Check className="h-4 w-4 mr-2" />
              Mark Resolved
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => handleAction(() => dismissReport(report.id))}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Dismiss Report
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}