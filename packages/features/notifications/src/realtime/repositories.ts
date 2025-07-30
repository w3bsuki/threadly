export interface User {
  id: string;
  clerkId: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  notificationPreferences?: unknown;
}

export interface Conversation {
  id: string;
  buyerId: string;
  sellerId: string;
  buyer?: User;
  seller?: User;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  metadata?: unknown;
  read: boolean;
  readAt?: Date | null;
  createdAt: Date;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  product?: { title: string };
}

export interface ConversationRepository {
  findById(id: string): Promise<Conversation | null>;
  findByUserAccess(
    conversationId: string,
    userId: string
  ): Promise<Conversation | null>;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByClerkId(clerkId: string): Promise<User | null>;
  updatePreferences(userId: string, preferences: unknown): Promise<User>;
}

export interface NotificationRepository {
  create(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
    metadata: string;
    read: boolean;
  }): Promise<Notification>;

  update(
    id: string,
    userId: string,
    data: { read: boolean; readAt?: Date }
  ): Promise<Notification>;

  updateMany(
    userId: string,
    data: { read: boolean; readAt?: Date }
  ): Promise<{ count: number }>;

  countUnread(userId: string): Promise<number>;
}

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
}
