import { database } from '@repo/database';
import type { Prisma } from '@repo/database';

// Test database helpers
export class TestDatabase {
  // Clean all tables
  static async cleanup() {
    const tablenames = await database.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname='public'
    `;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter(name => name !== '_prisma_migrations')
      .map(name => `"public"."${name}"`)
      .join(', ');

    try {
      await database.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
    }
  }

  // Create test user
  static async createUser(data?: Partial<Prisma.UserCreateInput>) {
    return database.user.create({
      data: {
        clerkId: `test_${Date.now()}_${Math.random()}`,
        email: `test+${Date.now()}@example.com`,
        firstName: 'Test',
        lastName: 'User',
        ...data,
      },
    });
  }

  // Create test category
  static async createCategory(data?: Partial<Prisma.CategoryCreateInput>) {
    return database.category.create({
      data: {
        name: `Test Category ${Date.now()}`,
        slug: `test-category-${Date.now()}`,
        ...data,
      },
    });
  }

  // Create test product
  static async createProduct(
    sellerId: string,
    categoryId: string,
    data?: Partial<Prisma.ProductUncheckedCreateInput>
  ) {
    return database.product.create({
      data: {
        title: `Test Product ${Date.now()}`,
        description: 'A test product for testing purposes',
        price: 2999, // $29.99
        condition: 'GOOD',
        status: 'AVAILABLE',
        sellerId,
        categoryId,
        ...data,
      },
    });
  }

  // Create test product with images
  static async createProductWithImages(
    sellerId: string,
    categoryId: string,
    imageCount = 3,
    data?: Partial<Prisma.ProductUncheckedCreateInput>
  ) {
    const product = await this.createProduct(sellerId, categoryId, data);
    
    const images = await Promise.all(
      Array.from({ length: imageCount }, (_, index) =>
        database.productImage.create({
          data: {
            productId: product.id,
            imageUrl: `https://example.com/image-${index + 1}.jpg`,
            displayOrder: index,
          },
        })
      )
    );

    return { product, images };
  }

  // Create test order
  static async createOrder(
    buyerId: string,
    sellerId: string,
    productId: string,
    data?: Partial<Prisma.OrderUncheckedCreateInput>
  ) {
    // Create a default shipping address if none provided
    let shippingAddressId = data?.shippingAddressId;
    if (!shippingAddressId) {
      const address = await database.address.create({
        data: {
          userId: buyerId,
          firstName: 'Test',
          lastName: 'User',
          streetLine1: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'US',
          isDefault: true,
          type: 'SHIPPING',
        },
      });
      shippingAddressId = address.id;
    }

    return database.order.create({
      data: {
        buyerId,
        sellerId,
        productId,
        amount: 2999,
        status: 'PENDING',
        shippingAddressId: shippingAddressId!, // We know this is defined after the check above
        ...data,
      },
    });
  }

  // Create test conversation
  static async createConversation(
    buyerId: string,
    sellerId: string,
    productId: string,
    data?: Partial<Prisma.ConversationUncheckedCreateInput>
  ) {
    return database.conversation.create({
      data: {
        buyerId,
        sellerId,
        productId,
        status: 'ACTIVE',
        ...data,
      },
    });
  }

  // Create test message
  static async createMessage(
    conversationId: string,
    senderId: string,
    data?: Partial<Prisma.MessageUncheckedCreateInput>
  ) {
    return database.message.create({
      data: {
        conversationId,
        senderId,
        content: `Test message ${Date.now()}`,
        read: false,
        ...data,
      },
    });
  }

  // Create test notification
  static async createNotification(
    userId: string,
    data?: Partial<Prisma.NotificationUncheckedCreateInput>
  ) {
    return database.notification.create({
      data: {
        userId,
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'SYSTEM',
        read: false,
        ...data,
      },
    });
  }

  // Seed test data for integration tests
  static async seedTestData() {
    // Create test users
    const seller = await this.createUser({
      firstName: 'John',
      lastName: 'Seller',
      email: 'seller@test.com',
      clerkId: 'test_seller',
    });

    const buyer = await this.createUser({
      firstName: 'Jane',
      lastName: 'Buyer', 
      email: 'buyer@test.com',
      clerkId: 'test_buyer',
    });

    // Create test categories
    const categories = await Promise.all([
      this.createCategory({ name: 'Electronics', slug: 'electronics' }),
      this.createCategory({ name: 'Clothing', slug: 'clothing' }),
      this.createCategory({ name: 'Books', slug: 'books' }),
    ]);

    // Create test products
    const products = await Promise.all([
      this.createProductWithImages(seller.id, categories[0].id, 2, {
        title: 'iPhone 12',
        price: 59999,
        condition: 'VERY_GOOD',
      }),
      this.createProductWithImages(seller.id, categories[1].id, 3, {
        title: 'Nike Air Max',
        price: 12999,
        condition: 'GOOD',
      }),
      this.createProductWithImages(seller.id, categories[2].id, 1, {
        title: 'JavaScript Book',
        price: 2999,
        condition: 'NEW_WITHOUT_TAGS',
      }),
    ]);

    // Create test conversation and messages
    const conversation = await this.createConversation(
      buyer.id,
      seller.id,
      products[0].product.id
    );

    await Promise.all([
      this.createMessage(conversation.id, buyer.id, {
        content: 'Is this still available?',
      }),
      this.createMessage(conversation.id, seller.id, {
        content: 'Yes, it is! Would you like to buy it?',
      }),
    ]);

    return {
      users: { seller, buyer },
      categories,
      products,
      conversation,
    };
  }

  // Generate realistic test data
  static async generateRealisticData(count: {
    users?: number;
    categories?: number;
    products?: number;
    orders?: number;
  } = {}) {
    const {
      users: userCount = 10,
      categories: categoryCount = 5,
      products: productCount = 50,
      orders: orderCount = 20,
    } = count;

    // Create users
    const users = await Promise.all(
      Array.from({ length: userCount }, (_, i) =>
        this.createUser({
          firstName: `User${i}`,
          lastName: `Test`,
          email: `user${i}@test.com`,
          clerkId: `test_user_${i}`,
        })
      )
    );

    // Create categories
    const categories = await Promise.all(
      Array.from({ length: categoryCount }, (_, i) =>
        this.createCategory({
          name: `Category ${i}`,
          slug: `category-${i}`,
        })
      )
    );

    // Create products
    const products = await Promise.all(
      Array.from({ length: productCount }, async (_, i) => {
        const sellerId = users[Math.floor(Math.random() * users.length)].id;
        const categoryId = categories[Math.floor(Math.random() * categories.length)].id;
        
        return this.createProductWithImages(sellerId, categoryId, 2, {
          title: `Product ${i}`,
          price: Math.floor(Math.random() * 50000) + 1000, // $10 - $500
          condition: ['NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'VERY_GOOD', 'GOOD', 'SATISFACTORY'][
            Math.floor(Math.random() * 5)
          ] as any,
        });
      })
    );

    // Create orders
    const orders = await Promise.all(
      Array.from({ length: orderCount }, async (_, i) => {
        const product = products[Math.floor(Math.random() * products.length)];
        const buyerId = users[Math.floor(Math.random() * users.length)].id;
        
        // Make sure buyer is not the seller
        if (buyerId === product.product.sellerId) {
          return null;
        }

        return this.createOrder(
          buyerId,
          product.product.sellerId,
          product.product.id,
          {
            amount: product.product.price,
            status: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'][
              Math.floor(Math.random() * 4)
            ] as any,
          }
        );
      })
    );

    return {
      users,
      categories,
      products,
      orders: orders.filter(Boolean),
    };
  }

  // Wait for database operations to complete
  static async waitForDatabase() {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Check database connection
  static async checkConnection() {
    try {
      await database.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}

// Database transaction helper for tests
export async function withTransaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return database.$transaction(callback);
}

// Helper to count records in tables
export async function getTableCounts() {
  const [
    userCount,
    productCount,
    orderCount,
    conversationCount,
    messageCount,
    notificationCount,
  ] = await Promise.all([
    database.user.count(),
    database.product.count(),
    database.order.count(),
    database.conversation.count(),
    database.message.count(),
    database.notification.count(),
  ]);

  return {
    users: userCount,
    products: productCount,
    orders: orderCount,
    conversations: conversationCount,
    messages: messageCount,
    notifications: notificationCount,
  };
}

export { TestDatabase as testDb };