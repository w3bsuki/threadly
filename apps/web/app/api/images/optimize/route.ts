import { cache } from '@repo/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ImageOptimizationService } from '../../../../lib/image-optimization';

const querySchema = z.object({
  url: z.string().url(),
  w: z.string().transform(Number).optional(),
  h: z.string().transform(Number).optional(),
  q: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  f: z.enum(['webp', 'avif', 'original']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validation = querySchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    const { url, w: width, h: height, q: quality, f: format } = validation.data;

    // Create cache key
    const cacheKey = `optimized_image:${url}:${width}:${height}:${quality}:${format}`;

    // Check cache first
    const cached = await cache.get<{
      data: string;
      contentType: string;
      headers: Record<string, string>;
    }>(cacheKey);
    if (cached?.data) {
      const buffer = Buffer.from(cached.data, 'base64');
      return new NextResponse(buffer, {
        headers: cached.headers,
      });
    }

    // Fetch original image
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Threadly Image Optimizer',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: response.status }
      );
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // Optimize image
    const optimized = await ImageOptimizationService.optimizeImage(buffer, {
      width,
      height,
      quality,
      format,
    });

    // Cache the result (store as base64 string)
    await cache.set(
      cacheKey,
      {
        data: optimized.data.toString('base64'),
        contentType: optimized.contentType,
        headers: optimized.headers,
      },
      { ttl: 60 * 60 * 24 * 7 } // 7 days cache
    );

    return new NextResponse(optimized.data, {
      headers: optimized.headers,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
