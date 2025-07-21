import { database } from '@repo/database';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { 
  AlertTriangle,
  User,
  Package,
  MessageCircle,
  Check,
  X,
  Eye,
  Clock
} from 'lucide-react';
import { ReportActions } from './report-actions';
import Link from 'next/link';

const AdminReportsPage: React.FC = async () => {
  // Get reports from database
  const reports = await database.report.findMany({
    where: {
      status: { in: ['PENDING', 'UNDER_REVIEW'] }
    },
    include: {
      User_Report_reporterIdToUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        }
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
            }
          }
        }
      },
      User_Report_reportedUserIdToUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        }
      }
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
        <h1 className="text-3xl font-bold">Content Moderation</h1>
        <p className="text-muted-foreground mt-2">
          Review and manage user reports
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.underReview}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Dismissed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.dismissed}</div>
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
              <div key={report.id} className="border rounded-[var(--radius-lg)] p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-[var(--radius-lg)] bg-red-50 text-red-600">
                      {report.type === 'PRODUCT' && <Package className="h-4 w-4" />}
                      {report.type === 'USER' && <User className="h-4 w-4" />}
                      {report.type === 'MESSAGE' && <MessageCircle className="h-4 w-4" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{report.reason}</h3>
                        <Badge variant={
                          report.status === 'PENDING' ? 'destructive' :
                          report.status === 'UNDER_REVIEW' ? 'default' :
                          report.status === 'RESOLVED' ? 'secondary' :
                          'outline'
                        }>
                          {report.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {report.description || 'No additional details provided'}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Type: <span className="font-medium">{report.type}</span>
                        </span>
                        <span>
                          Target: {report.type === 'PRODUCT' ? 
                            report.Product?.title || 'Deleted Product' : 
                            `${report.User_Report_reportedUserIdToUser?.firstName || ''} ${report.User_Report_reportedUserIdToUser?.lastName || ''}`.trim() || 'Unknown User'
                          }
                        </span>
                        <span>
                          Reported by: {`${report.User_Report_reporterIdToUser.firstName || ''} ${report.User_Report_reporterIdToUser.lastName || ''}`.trim() || report.User_Report_reporterIdToUser.email}
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
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/product/${report.Product.id}`} target="_blank">
                          <Eye className="h-3 w-3 mr-1" />
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
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No reports to review</h3>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" asChild>
              <Link href="/admin/users">
                <User className="h-4 w-4 mr-2" />
                Manage Users
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/admin/products">
                <Package className="h-4 w-4 mr-2" />
                Review Products
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/admin">
                <AlertTriangle className="h-4 w-4 mr-2" />
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