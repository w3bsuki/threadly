// Mock data for testing

export const mockUsers = [
  {
    id: 'user_1',
    clerkId: 'clerk_user_1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    imageUrl: 'https://example.com/avatar1.jpg',
    location: 'New York, NY',
    averageRating: 4.8,
    totalSales: 15,
  },
  {
    id: 'user_2',
    clerkId: 'clerk_user_2',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    imageUrl: 'https://example.com/avatar2.jpg',
    location: 'Los Angeles, CA',
    averageRating: 4.6,
    totalSales: 8,
  },
];

export const mockCategories = [
  {
    id: 'cat_1',
    name: 'Electronics',
    slug: 'electronics',
  },
  {
    id: 'cat_2',
    name: 'Clothing',
    slug: 'clothing',
  },
  {
    id: 'cat_3',
    name: 'Books',
    slug: 'books',
  },
];

export const mockProducts = [
  {
    id: 'prod_1',
    title: 'iPhone 13 Pro',
    description: 'Excellent condition iPhone 13 Pro with all accessories',
    brand: 'Apple',
    price: 79_999, // $799.99
    condition: 'VERY_GOOD',
    size: '128GB',
    categoryId: 'cat_1',
    categoryName: 'Electronics',
    sellerId: 'user_1',
    sellerName: 'John Doe',
    sellerRating: 4.8,
    sellerLocation: 'New York, NY',
    images: [
      'https://example.com/iphone1.jpg',
      'https://example.com/iphone2.jpg',
    ],
    views: 245,
    favorites: 18,
    status: 'AVAILABLE',
    createdAt: Date.now() / 1000,
    tags: ['iphone', 'apple', 'smartphone', 'electronics'],
    colors: ['blue'],
    materials: ['aluminum', 'glass'],
    availableForTrade: false,
  },
  {
    id: 'prod_2',
    title: 'Nike Air Max 90',
    description: 'Classic Nike Air Max 90 sneakers in great condition',
    brand: 'Nike',
    price: 12_999, // $129.99
    condition: 'GOOD',
    size: '10',
    categoryId: 'cat_2',
    categoryName: 'Clothing',
    sellerId: 'user_2',
    sellerName: 'Jane Smith',
    sellerRating: 4.6,
    sellerLocation: 'Los Angeles, CA',
    images: [
      'https://example.com/nike1.jpg',
      'https://example.com/nike2.jpg',
      'https://example.com/nike3.jpg',
    ],
    views: 156,
    favorites: 12,
    status: 'AVAILABLE',
    createdAt: (Date.now() - 86_400_000) / 1000, // 1 day ago
    tags: ['nike', 'sneakers', 'shoes', 'clothing'],
    colors: ['white', 'black'],
    materials: ['leather', 'rubber'],
    availableForTrade: true,
  },
  {
    id: 'prod_3',
    title: 'JavaScript: The Definitive Guide',
    description: 'Comprehensive guide to JavaScript programming',
    brand: "O'Reilly",
    price: 2999, // $29.99
    condition: 'NEW_WITHOUT_TAGS',
    size: 'Standard',
    categoryId: 'cat_3',
    categoryName: 'Books',
    sellerId: 'user_1',
    sellerName: 'John Doe',
    sellerRating: 4.8,
    sellerLocation: 'New York, NY',
    images: ['https://example.com/book1.jpg'],
    views: 89,
    favorites: 6,
    status: 'AVAILABLE',
    createdAt: (Date.now() - 172_800_000) / 1000, // 2 days ago
    tags: ['javascript', 'programming', 'book', 'education'],
    colors: [],
    materials: ['paper'],
    availableForTrade: false,
  },
];

export const mockOrders = [
  {
    id: 'order_1',
    buyerId: 'user_2',
    sellerId: 'user_1',
    productId: 'prod_1',
    amount: 79_999,
    status: 'DELIVERED',
    createdAt: new Date(Date.now() - 604_800_000).toISOString(), // 1 week ago
    shippedAt: new Date(Date.now() - 518_400_000).toISOString(), // 6 days ago
    deliveredAt: new Date(Date.now() - 259_200_000).toISOString(), // 3 days ago
    trackingNumber: 'TRK123456789',
    buyer: mockUsers[1],
    seller: mockUsers[0],
    product: mockProducts[0],
  },
  {
    id: 'order_2',
    buyerId: 'user_1',
    sellerId: 'user_2',
    productId: 'prod_2',
    amount: 12_999,
    status: 'SHIPPED',
    createdAt: new Date(Date.now() - 172_800_000).toISOString(), // 2 days ago
    shippedAt: new Date(Date.now() - 86_400_000).toISOString(), // 1 day ago
    deliveredAt: null,
    trackingNumber: 'TRK987654321',
    buyer: mockUsers[0],
    seller: mockUsers[1],
    product: mockProducts[1],
  },
];

export const mockConversations = [
  {
    id: 'conv_1',
    buyerId: 'user_2',
    sellerId: 'user_1',
    productId: 'prod_1',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 3_600_000).toISOString(),
    buyer: mockUsers[1],
    seller: mockUsers[0],
    product: mockProducts[0],
    messages: [
      {
        id: 'msg_1',
        conversationId: 'conv_1',
        senderId: 'user_2',
        content: 'Is this iPhone still available?',
        read: true,
        createdAt: new Date(Date.now() - 86_400_000).toISOString(),
      },
      {
        id: 'msg_2',
        conversationId: 'conv_1',
        senderId: 'user_1',
        content:
          "Yes! It's in excellent condition. Would you like to see more photos?",
        read: true,
        createdAt: new Date(Date.now() - 82_800_000).toISOString(),
      },
      {
        id: 'msg_3',
        conversationId: 'conv_1',
        senderId: 'user_2',
        content: 'That would be great, thanks!',
        read: false,
        createdAt: new Date(Date.now() - 3_600_000).toISOString(),
      },
    ],
    _count: {
      messages: 1, // Unread messages for current user
    },
  },
];

export const mockNotifications = [
  {
    id: 'notif_1',
    userId: 'user_1',
    title: 'New Order Received',
    message: 'Jane Smith placed an order for your iPhone 13 Pro',
    type: 'ORDER',
    metadata: { orderId: 'order_1', productId: 'prod_1' },
    read: false,
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
  },
  {
    id: 'notif_2',
    userId: 'user_1',
    title: 'New Message',
    message: 'You have a new message from Jane Smith',
    type: 'MESSAGE',
    metadata: { conversationId: 'conv_1', messageId: 'msg_3' },
    read: false,
    createdAt: new Date(Date.now() - 1_800_000).toISOString(),
  },
];

export const mockPayments = [
  {
    id: 'pay_1',
    orderId: 'order_1',
    stripePaymentId: 'pi_test_123456',
    amount: 79_999,
    status: 'succeeded',
    createdAt: new Date(Date.now() - 604_800_000).toISOString(),
  },
];

export const mockReviews = [
  {
    id: 'rev_1',
    orderId: 'order_1',
    reviewerId: 'user_2',
    reviewedId: 'user_1',
    rating: 5,
    comment:
      'Great seller! iPhone was exactly as described and shipped quickly.',
    createdAt: new Date(Date.now() - 259_200_000).toISOString(),
  },
];

// Helper to generate additional mock data
export function generateMockProducts(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `prod_generated_${i}`,
    title: `Test Product ${i}`,
    description: `Description for test product ${i}`,
    brand: ['Apple', 'Samsung', 'Nike', 'Adidas', 'Generic'][i % 5],
    price: Math.floor(Math.random() * 50_000) + 1000,
    condition: [
      'NEW_WITH_TAGS',
      'NEW_WITHOUT_TAGS',
      'VERY_GOOD',
      'GOOD',
      'SATISFACTORY',
    ][i % 5],
    size: ['S', 'M', 'L', 'XL', 'One Size'][i % 5],
    categoryId: mockCategories[i % mockCategories.length]?.id || '',
    categoryName: mockCategories[i % mockCategories.length]?.name || '',
    sellerId: mockUsers[i % mockUsers.length]?.id || '',
    sellerName:
      (mockUsers[i % mockUsers.length]?.firstName || '') +
      ' ' +
      (mockUsers[i % mockUsers.length]?.lastName || ''),
    sellerRating: 4 + Math.random(),
    sellerLocation: mockUsers[i % mockUsers.length]?.location || '',
    images: [`https://example.com/product${i}.jpg`],
    views: Math.floor(Math.random() * 1000),
    favorites: Math.floor(Math.random() * 50),
    status: 'AVAILABLE',
    createdAt: (Date.now() - Math.random() * 2_592_000_000) / 1000, // Random within last 30 days
    tags: [`tag${i}`, 'test', 'product'],
    colors: ['red', 'blue', 'green', 'black', 'white'][i % 5],
    materials: ['cotton', 'polyester', 'leather', 'metal', 'plastic'][i % 5],
    availableForTrade: Math.random() > 0.5,
  }));
}

// Current user mock (for auth context)
export const mockCurrentUser = {
  id: 'current-user',
  clerkId: 'clerk_current_user',
  email: 'current@example.com',
  firstName: 'Current',
  lastName: 'User',
  imageUrl: 'https://example.com/current-avatar.jpg',
  location: 'San Francisco, CA',
  averageRating: 4.9,
  totalSales: 25,
};
