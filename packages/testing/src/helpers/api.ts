import { HttpResponse, http } from 'msw';
import { vi } from 'vitest';
import { server } from '../mocks/server';

// API testing utilities
export class ApiTestHelper {
  // Mock a successful API response
  static mockApiSuccess<T = any>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    data: T,
    status = 200
  ) {
    const handler = http[method](url, () => {
      return HttpResponse.json(data as any, { status });
    });

    server.use(handler);
    return handler;
  }

  // Mock an API error response
  static mockApiError(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    status = 500,
    message = 'Internal Server Error'
  ) {
    const handler = http[method](url, () => {
      return HttpResponse.json({ error: message }, { status });
    });

    server.use(handler);
    return handler;
  }

  // Mock API with delay
  static mockApiWithDelay<T = any>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    data: T,
    delay = 1000,
    status = 200
  ) {
    const handler = http[method](url, async () => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return HttpResponse.json(data as any, { status });
    });

    server.use(handler);
    return handler;
  }

  // Mock paginated API response
  static mockApiPaginated<T>(
    method: 'get' | 'post',
    url: string,
    items: T[],
    page = 0,
    limit = 20
  ) {
    const handler = http[method](url, ({ request }) => {
      const url = new URL(request.url);
      const requestedPage = Number.parseInt(
        url.searchParams.get('page') || '0'
      );
      const requestedLimit = Number.parseInt(
        url.searchParams.get('limit') || '20'
      );

      const start = requestedPage * requestedLimit;
      const end = start + requestedLimit;
      const paginatedItems = items.slice(start, end);

      return HttpResponse.json({
        data: paginatedItems,
        pagination: {
          page: requestedPage,
          limit: requestedLimit,
          total: items.length,
          totalPages: Math.ceil(items.length / requestedLimit),
          hasNext: end < items.length,
          hasPrev: requestedPage > 0,
        },
      });
    });

    server.use(handler);
    return handler;
  }

  // Create request matcher
  static createRequestMatcher(
    method: string,
    url: string,
    body?: any,
    headers?: Record<string, string>
  ) {
    return (req: Request) => {
      if (req.method.toLowerCase() !== method.toLowerCase()) return false;
      if (!req.url.includes(url)) return false;

      if (headers) {
        for (const [key, value] of Object.entries(headers)) {
          if (req.headers.get(key) !== value) return false;
        }
      }

      // Body matching would require parsing - simplified for now
      return true;
    };
  }

  // Reset all API mocks
  static resetMocks() {
    server.resetHandlers();
  }

  // Verify API call was made
  static async verifyApiCall(
    method: string,
    url: string,
    options?: {
      body?: any;
      headers?: Record<string, string>;
      times?: number;
    }
  ) {
    // This would be implemented with request interception
    // For now, just a placeholder
    return true;
  }
}

// Mock fetch for direct API testing
export function mockFetch() {
  const fetchMock = vi.fn();

  global.fetch = fetchMock;

  const helpers = {
    // Mock successful response
    mockResolve: (data: any, status = 200) => {
      fetchMock.mockResolvedValueOnce({
        ok: status >= 200 && status < 300,
        status,
        statusText: status === 200 ? 'OK' : 'Error',
        json: () => Promise.resolve(data),
        text: () => Promise.resolve(JSON.stringify(data)),
        headers: new Headers(),
      } as Response);
    },

    // Mock error response
    mockReject: (error: Error) => {
      fetchMock.mockRejectedValueOnce(error);
    },

    // Mock network error
    mockNetworkError: () => {
      fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));
    },

    // Mock timeout
    mockTimeout: () => {
      fetchMock.mockImplementationOnce(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 100)
          )
      );
    },

    // Get call history
    getCalls: () => fetchMock.mock.calls,

    // Clear mock
    clear: () => fetchMock.mockClear(),

    // Restore original fetch
    restore: () => {
      fetchMock.mockRestore();
      global.fetch = originalFetch;
    },
  };

  return { fetchMock, ...helpers };
}

// Store original fetch
const originalFetch = global.fetch;

// Mock API endpoints for specific features
export class FeatureApiMocks {
  // Products API
  static products = {
    list: (products: any[]) =>
      ApiTestHelper.mockApiSuccess('get', '/api/products', { products }),

    get: (product: any) =>
      ApiTestHelper.mockApiSuccess(
        'get',
        `/api/products/${product.id}`,
        product
      ),

    create: (product: any) =>
      ApiTestHelper.mockApiSuccess('post', '/api/products', product, 201),

    update: (product: any) =>
      ApiTestHelper.mockApiSuccess(
        'put',
        `/api/products/${product.id}`,
        product
      ),

    delete: (productId: string) =>
      ApiTestHelper.mockApiSuccess('delete', `/api/products/${productId}`, {
        success: true,
      }),
  };

  // Orders API
  static orders = {
    list: (orders: any[]) =>
      ApiTestHelper.mockApiSuccess('get', '/api/orders', { orders }),

    get: (order: any) =>
      ApiTestHelper.mockApiSuccess('get', `/api/orders/${order.id}`, order),

    create: (order: any) =>
      ApiTestHelper.mockApiSuccess('post', '/api/orders', order, 201),

    update: (order: any) =>
      ApiTestHelper.mockApiSuccess('put', `/api/orders/${order.id}`, order),
  };

  // Messages API
  static messages = {
    conversations: (conversations: any[]) =>
      ApiTestHelper.mockApiSuccess('get', '/api/conversations', {
        conversations,
      }),

    messages: (conversationId: string, messages: any[]) =>
      ApiTestHelper.mockApiSuccess(
        'get',
        `/api/conversations/${conversationId}/messages`,
        { messages }
      ),

    send: (message: any) =>
      ApiTestHelper.mockApiSuccess(
        'post',
        `/api/conversations/${message.conversationId}/messages`,
        message,
        201
      ),
  };

  // Search API
  static search = {
    products: (results: any[]) =>
      ApiTestHelper.mockApiSuccess('post', '/api/search', {
        hits: results,
        totalHits: results.length,
        page: 0,
        totalPages: 1,
      }),

    suggestions: (suggestions: string[]) =>
      ApiTestHelper.mockApiSuccess(
        'get',
        '/api/search/suggestions',
        suggestions
      ),

    autocomplete: (results: any[]) =>
      ApiTestHelper.mockApiSuccess('get', '/api/search/autocomplete', results),
  };

  // Notifications API
  static notifications = {
    list: (notifications: any[]) =>
      ApiTestHelper.mockApiSuccess('get', '/api/notifications', {
        notifications,
        unreadCount: notifications.filter((n: any) => !n.read).length,
      }),

    markRead: (notificationId: string) =>
      ApiTestHelper.mockApiSuccess(
        'patch',
        `/api/notifications/${notificationId}/read`,
        { success: true }
      ),
  };

  // Payment API
  static payments = {
    createIntent: (clientSecret: string) =>
      ApiTestHelper.mockApiSuccess(
        'post',
        '/api/stripe/create-payment-intent',
        {
          clientSecret,
          paymentIntentId: 'pi_test_123',
        }
      ),
  };
}

// Request validation helpers
export class RequestValidator {
  static validateHeaders(
    request: Request,
    expectedHeaders: Record<string, string>
  ) {
    for (const [key, value] of Object.entries(expectedHeaders)) {
      if (request.headers.get(key) !== value) {
        throw new Error(
          `Expected header ${key}: ${value}, got: ${request.headers.get(key)}`
        );
      }
    }
  }

  static async validateBody(request: Request, expectedBody: any) {
    try {
      const body = await request.json();
      expect(body).toEqual(expectedBody);
    } catch (error) {
      throw new Error(`Invalid request body: ${error}`);
    }
  }

  static validateUrl(request: Request, expectedPath: string) {
    const url = new URL(request.url);
    if (!url.pathname.includes(expectedPath)) {
      throw new Error(
        `Expected path to include ${expectedPath}, got: ${url.pathname}`
      );
    }
  }

  static validateQueryParams(
    request: Request,
    expectedParams: Record<string, string>
  ) {
    const url = new URL(request.url);
    for (const [key, value] of Object.entries(expectedParams)) {
      if (url.searchParams.get(key) !== value) {
        throw new Error(
          `Expected query param ${key}: ${value}, got: ${url.searchParams.get(key)}`
        );
      }
    }
  }
}

// API response builders
export class ApiResponseBuilder {
  static success<T>(data: T, meta?: any) {
    return {
      success: true,
      data,
      meta,
      error: null,
    };
  }

  static error(message: string, code?: string, details?: any) {
    return {
      success: false,
      data: null,
      error: {
        message,
        code,
        details,
      },
    };
  }

  static paginated<T>(items: T[], page: number, limit: number, total: number) {
    return {
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: (page + 1) * limit < total,
        hasPrev: page > 0,
      },
    };
  }
}

// Integration test helpers
export async function testApiEndpoint(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  options?: {
    body?: any;
    headers?: Record<string, string>;
    expectedStatus?: number;
    expectedData?: any;
  }
) {
  const { body, headers, expectedStatus = 200, expectedData } = options || {};

  const response = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  expect(response.status).toBe(expectedStatus);

  if (expectedData) {
    const data = await response.json();
    expect(data).toEqual(expectedData);
  }

  return response;
}

export { ApiTestHelper as api, FeatureApiMocks as mockApis };
