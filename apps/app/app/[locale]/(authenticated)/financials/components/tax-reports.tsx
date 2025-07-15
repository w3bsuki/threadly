import { database } from '@repo/database';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { FileText, Download, Plus } from 'lucide-react';
import Link from 'next/link';

interface TaxReportsProps {
  userId: string;
}

export async function TaxReports({ userId }: TaxReportsProps) {
  const currentYear = new Date().getFullYear();
  
  const reports = await database.taxReport.findMany({
    where: { userId },
    orderBy: [
      { year: 'desc' },
      { quarter: 'desc' }
    ]
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      DRAFT: 'secondary',
      FINAL: 'default',
      SUBMITTED: 'outline',
      AMENDED: 'destructive'
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Generate Report Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tax Reports</h3>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No tax reports generated yet</p>
              <Button className="mt-4" size="sm">
                Generate Your First Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">
                      {report.year} {report.quarter ? `Q${report.quarter}` : 'Annual'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Generated {new Date(report.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(report.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Income</span>
                    <span className="font-medium">${Number(report.totalIncome).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Expenses</span>
                    <span className="font-medium text-red-600">-${Number(report.totalExpenses).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform Fees</span>
                    <span className="font-medium text-red-600">-${Number(report.platformFees).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Net Income</span>
                    <span className="text-green-600">${Number(report.netIncome).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  {report.reportUrl && (
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Tax Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Summary - {currentYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Estimated Tax Liability</span>
              <span className="text-2xl font-bold">$0.00</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Based on your current income and expenses. Consult a tax professional for accurate calculations.
            </p>
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Deductible Categories</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping Costs</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Packaging Materials</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fees</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Marketing Expenses</span>
                  <span>$0.00</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}