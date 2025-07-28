import { auth } from '@repo/auth/server';
import { log, logError } from '@repo/observability/server';
import { checkRateLimit, generalApiLimit } from '@repo/security';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const feedbackSchema = z.object({
  type: z.enum(['suggestion', 'bug', 'compliment', 'general']),
  subject: z.string().min(1, 'Subject is required').max(100),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000),
  email: z.string().email().optional(),
  rating: z.number().min(1).max(5).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateLimitResult.error?.message || 'Rate limit exceeded',
        },
        {
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);

    // Log feedback (in production, this would send emails)
    log.info('New feedback received:', {
      userId,
      type: validatedData.type,
      subject: validatedData.subject,
      message: validatedData.message,
      rating: validatedData.rating,
      email: validatedData.email,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
    });
  } catch (error) {
    logError('Feedback submission error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit feedback',
      },
      { status: 500 }
    );
  }
}
