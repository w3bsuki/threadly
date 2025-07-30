import { NextResponse } from 'next/server';

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: Array<{
      field?: string;
      message: string;
      code?: string;
    }>;
    timestamp: string;
    path?: string;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export class ResponseBuilder {
  static success<T>(
    data: T,
    statusCode = 200,
    meta?: ApiSuccessResponse['meta']
  ): NextResponse<ApiSuccessResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
        meta,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }

  static created<T>(data: T): NextResponse<ApiSuccessResponse<T>> {
    return ResponseBuilder.success(data, 201);
  }

  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  }

  static paginated<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    }
  ): NextResponse<ApiSuccessResponse<T[]>> {
    const totalPages = Math.ceil(pagination.total / pagination.limit);

    return ResponseBuilder.success(data, 200, {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
    });
  }

  static redirect(url: string, permanent = false): NextResponse {
    return NextResponse.redirect(url, permanent ? 308 : 307);
  }

  static file(
    data: Buffer | Uint8Array | string,
    filename: string,
    contentType = 'application/octet-stream'
  ): NextResponse {
    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new NextResponse(data, {
      status: 200,
      headers,
    });
  }

  static json<T>(data: T, init?: ResponseInit): NextResponse<T> {
    return NextResponse.json(data, init);
  }
}

// Helper functions for easier usage
export const createSuccessResponse = <T>(
  data: T,
  statusCode = 200,
  meta?: ApiSuccessResponse['meta']
): NextResponse<ApiSuccessResponse<T>> => {
  return ResponseBuilder.success(data, statusCode, meta);
};

export const createErrorResponse = (
  message: string,
  statusCode = 400,
  code = 'BAD_REQUEST',
  details?: ApiErrorResponse['error']['details']
): NextResponse<ApiErrorResponse> => {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        statusCode,
        details,
        timestamp: new Date().toISOString(),
      },
    },
    { status: statusCode }
  );
};

export const createPaginationMeta = (
  page: number,
  limit: number,
  total: number
): ApiSuccessResponse['meta'] => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
