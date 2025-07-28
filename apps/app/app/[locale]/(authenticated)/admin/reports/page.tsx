import { database } from '@repo/database';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components';
import {
  AlertTriangle,
  Check,
  Clock,
  Eye,
  MessageCircle,
  Package,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { ReportActions } from './report-actions';

const AdminReportsPage: React.FC = async () => {
  // Get reports from database
  const reports = await database.report.findMany({
    where: {
      status: { in: ['PENDING', 'UNDER_REVIEW'] },
    },
    include: {
      User_Report_reporterIdToUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      Product: {
        select: {
          id: true,
          title: true,
          status: true,
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      User_Report_reportedUserIdToUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  // Get stats
  const [pending, underReview, resolved, dismissed] = await Promise.all([
    database.report.count({ where: { status: 'PENDING' } }),
    database.report.count({ where: { status: 'UNDER_REVIEW' } }),
    database.report.count({ where: { status: 'RESOLVED' } }),
    database.report.count({ where: { status: 'DISMISSED' } }),
  ]);

  const stats = { pending, underReview, resolved, dismissed };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl">Content Moderation</h1>
        <p className="mt-2 text-muted-foreground">
          Review and manage user reports
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-medium text-sm">
              Pending Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-red-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-medium text-sm">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-yellow-600">
              {stats.underReview}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-medium text-sm">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-green-600">
              {stats.resolved}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-medium text-sm">Dismissed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-muted-foreground">
              {stats.dismissed}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                className="rounded-[var(--radius-lg)] border p-4"
                key={report.id}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-[var(--radius-lg)] bg-red-50 p-2 text-red-600">
                      {report.type === 'PRODUCT' && (
                        <Package className="h-4 w-4" />
                      )}
                      {report.type === 'USER' && <User className="h-4 w-4" />}
                      {report.type === 'MESSAGE' && (
                        <MessageCircle className="h-4 w-4" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="font-semibold">{report.reason}</h3>
                        <Badge
                          variant={
                            report.status === 'PENDING'
                              ? 'destructive'
                              : report.status === 'UNDER_REVIEW'
                                ? 'default'
                                : report.status === 'RESOLVED'
                                  ? 'secondary'
                                  : 'outline'
                          }
                        >
                          {report.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <p className="mb-2 text-muted-foreground text-sm">
                        {report.description || 'No additional details provided'}
                      </p>

                      <div className="flex items-center gap-4 text-muted-foreground text-sm">
                        <span>
                          Type:{' '}
                          <span className="font-medium">{report.type}</span>
                        </span>
                        <span>
                          Target:{' '}
                          {report.type === 'PRODUCT'
                            ? report.Product?.title || 'Deleted Product'
                            : `${report.User_Report_reportedUserIdToUser?.firstName || ''} ${report.User_Report_reportedUserIdToUser?.lastName || ''}`.trim() ||
                              'Unknown User'}
                        </span>
                        <span>
                          Reported by:{' '}
                          {`${report.User_Report_reporterIdToUser.firstName || ''} ${report.User_Report_reporterIdToUser.lastName || ''}`.trim() ||
                            report.User_Report_reporterIdToUser.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {report.type === 'PRODUCT' && report.Product && (
                      <Button asChild size="sm" variant="outline">
                        <Link
                          href={`/product/${report.Product.id}`}
                          target="_blank"
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Link>
                      </Button>
                    )}

                    <ReportActions report={report} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {reports.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              <AlertTriangle className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <h3 className="mb-2 font-semibold text-lg">
                No reports to review
              </h3>
              <p>All reports have been processed. Great job!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Moderation Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Button asChild variant="outline">
              <Link href="/admin/users">
                <User className="mr-2 h-4 w-4" />
                Manage Users
              </Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/admin/products">
                <Package className="mr-2 h-4 w-4" />
                Review Products
              </Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/admin">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReportsPage;
