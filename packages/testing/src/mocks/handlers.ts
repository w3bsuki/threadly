import { http, HttpResponse } from 'msw';
import { mockProducts, mockUsers, mockOrders, mockConversations } from './data';

export const handlers = [
  // Search API
  http.post('/api/search', async ({ request }) => {
    const { filters, page = 0, hitsPerPage = 20 } = await request.json() as any;
    
    let results = [...mockProducts];
    
    // Apply filters
    if (filters.query) {
      results = results.filter(product =>
        product.title.toLowerCase().includes(filters.query.toLowerCase()) ||
        product.brand?.toLowerCase().includes(filters.query.toLowerCase())
      );
    }
    
    if (filters.categories?.length) {
      results = results.filter(product =>
        filters.categories.includes(product.categoryName)
      );
    }
    
    if (filters.priceRange) {
      results = results.filter(product =>
        product.price >= filters.priceRange.min &&
        product.price <= filters.priceRange.max
      );
    }
    
    // Pagination
    const start = page * hitsPerPage;
    const end = start + hitsPerPage;
    const hits = results.slice(start, end);
    
    return HttpResponse.json({
      hits,
      totalHits: results.length,
      page,
      totalPages: Math.ceil(results.length / hitsPerPage),
      processingTimeMS: 10,
      facets: {
        categoryName: { 'Electronics': 10, 'Clothing': 15, 'Books': 5 },
        brand: { 'Apple': 5, 'Nike': 8, 'Samsung': 3 },
        condition: { 'NEW_WITH_TAGS': 12, 'GOOD': 18, 'VERY_GOOD': 8 },
      },
    });
  }),

  // Search suggestions
  http.get('/api/search/suggestions', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    
    if (query.length < 2) {
      return HttpResponse.json([]);
    }
    
    const suggestions = [
      { query, count: 25 },
      { query, category: 'Electronics', count: 10 },
      { query, category: 'Clothing', count: 8 },
    ];
    
    return HttpResponse.json(suggestions);
  }),

  // Autocomplete
  http.get('/api/search/autocomplete', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    
    if (query.length < 2) {
      return HttpResponse.json([]);
    }
    
    const results = mockProducts
      .filter(product =>
        product.title.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5)
      .map(product => ({
        id: product.id,
        title: product.title,
        brand: product.brand,
        price: product.price,
        image: product.images[0],
        category: product.categoryName,
      }));
    
    return HttpResponse.json(results);
  }),

  // Products API
  http.get('/api/products', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const category = url.searchParams.get('category');
    
    let results = [...mockProducts];
    
    if (category) {
      results = results.filter(product => product.categoryName === category);
    }
    
    const start = page * limit;
    const end = start + limit;
    const products = results.slice(start, end);
    
    return HttpResponse.json({
      products,
      total: results.length,
      page,
      totalPages: Math.ceil(results.length / limit),
    });
  }),

  http.get('/api/products/:id', ({ params }) => {
    const product = mockProducts.find(p => p.id === params.id);
    
    if (!product) {
      return HttpResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return HttpResponse.json(product);
  }),

  // Orders API
  http.get('/api/orders', ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type'); // 'buying' or 'selling'
    
    let results = [...mockOrders];
    
    if (type === 'buying') {
      results = results.filter(order => order.buyerId === 'current-user');
    } else if (type === 'selling') {
      results = results.filter(order => order.sellerId === 'current-user');
    }
    
    return HttpResponse.json(results);
  }),

  http.post('/api/orders', async ({ request }) => {
    const orderData = await request.json() as any;
    
    const newOrder = {
      id: `order_${Date.now()}`,
      ...orderData,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    
    return HttpResponse.json(newOrder, { status: 201 });
  }),

  // Messages API
  http.get('/api/conversations', ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    
    let results = [...mockConversations];
    
    if (type === 'buying') {
      results = results.filter(conv => conv.buyerId === 'current-user');
    } else if (type === 'selling') {
      results = results.filter(conv => conv.sellerId === 'current-user');
    }
    
    return HttpResponse.json(results);
  }),

  http.post('/api/conversations/:id/messages', async ({ params, request }) => {
    const messageData = await request.json() as any;
    
    const newMessage = {
      id: `msg_${Date.now()}`,
      conversationId: params.id,
      senderId: 'current-user',
      ...messageData,
      read: false,
      createdAt: new Date().toISOString(),
    };
    
    return HttpResponse.json(newMessage, { status: 201 });
  }),

  // Notifications API
  http.get('/api/notifications', () => {
    const notifications = [
      {
        id: '1',
        title: 'New Order',
        message: 'You have a new order for iPhone 12',
        type: 'ORDER',
        read: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Message Received',
        message: 'John sent you a message',
        type: 'MESSAGE',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
    ];
    
    return HttpResponse.json({
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
    });
  }),

  http.patch('/api/notifications/:id/read', ({ params }) => {
    return HttpResponse.json({ success: true });
  }),

  // Stripe payment intents
  http.post('/api/stripe/create-payment-intent', async ({ request }) => {
    const { amount } = await request.json() as any;
    
    return HttpResponse.json({
      clientSecret: `pi_test_${Date.now()}_secret_test`,
      paymentIntentId: `pi_test_${Date.now()}`,
    });
  }),

  // File upload
  http.post('/api/uploadthing', () => {
    return HttpResponse.json({
      url: 'https://example.com/uploaded-file.jpg',
      key: 'test-file-key',
    });
  }),

  // Real-time auth
  http.post('/api/real-time/auth', () => {
    return HttpResponse.json({
      auth: 'test-auth-token',
    });
  }),

  // Fallback for unhandled requests
  http.all('*', ({ request }) => {
    return HttpResponse.json(
      { error: 'Endpoint not mocked' },
      { status: 404 }
    );
  }),
];

// Helper to create custom handlers for specific tests
export function createMockHandler(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  path: string,
  response: any,
  status = 200
) {
  const httpMethod = http[method];
  return httpMethod(path, () => {
    return HttpResponse.json(response, { status });
  });
}

// Helper for error responses
export function createErrorHandler(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  path: string,
  status = 500,
  message = 'Internal Server Error'
) {
  const httpMethod = http[method];
  return httpMethod(path, () => {
    return HttpResponse.json({ error: message }, { status });
  });
}

// Helper for delayed responses
export function createDelayedHandler(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  path: string,
  response: any,
  delay = 1000,
  status = 200
) {
  const httpMethod = http[method];
  return httpMethod(path, async () => {
    await new Promise(resolve => setTimeout(resolve, delay));
    return HttpResponse.json(response, { status });
  });
}