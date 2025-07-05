import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, targetId, reason, description } = body;

    // Validate input
    if (!type || !targetId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user's database ID
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has already reported this item
    const existingReport = await database.report.findFirst({
      where: {
        reporterId: dbUser.id,
        OR: [
          { productId: type === 'PRODUCT' ? targetId : undefined },
          { reportedUserId: type === 'USER' ? targetId : undefined },
        ],
        status: { in: ['PENDING', 'UNDER_REVIEW'] }
      }
    });

    if (existingReport) {
      return NextResponse.json({ error: 'You have already reported this item' }, { status: 400 });
    }

    // Create the report
    const reportData: any = {
      reporterId: dbUser.id,
      type,
      reason,
      description,
      status: 'PENDING',
    };

    if (type === 'PRODUCT') {
      reportData.productId = targetId;
    } else if (type === 'USER') {
      reportData.reportedUserId = targetId;
    }

    const report = await database.report.create({
      data: reportData,
    });

    // Notify admins/moderators
    const adminsAndMods = await database.user.findMany({
      where: {
        role: { in: ['ADMIN', 'MODERATOR'] }
      },
      select: { id: true }
    });

    const notifications = adminsAndMods.map(admin => ({
      userId: admin.id,
      title: `New ${type.toLowerCase()} report`,
      message: `A ${type.toLowerCase()} has been reported for: ${reason}`,
      type: 'SYSTEM' as const,
      metadata: JSON.stringify({
        reportId: report.id,
        reportType: type,
        targetId,
      }),
    }));

    if (notifications.length > 0) {
      await database.notification.createMany({
        data: notifications,
      });
    }

    return NextResponse.json({ success: true, reportId: report.id });
  } catch (error) {
    logError('Error creating report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Get user's database ID
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, role: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only admins and moderators can view all reports
    if (!['ADMIN', 'MODERATOR'].includes(dbUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const reports = await database.report.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        product: {
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
        reportedUser: {
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

    return NextResponse.json({ reports });
  } catch (error) {
    logError('Error fetching reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}