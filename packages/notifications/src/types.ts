export interface NotificationPreferences {
  email: {
    orderUpdates: boolean;
    newMessages: boolean;
    paymentReceived: boolean;
    weeklyReport: boolean;
    marketing: boolean;
  };
  push: {
    orderUpdates: boolean;
    newMessages: boolean;
    paymentReceived: boolean;
  };
  inApp: {
    orderUpdates: boolean;
    newMessages: boolean;
    paymentReceived: boolean;
    systemAlerts: boolean;
  };
}

export interface User {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  notificationPreferences?: unknown;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  total: number;
  items: Array<{
    product: { 
      title: string;
      price: number;
      images: Array<{ url: string }>;
    };
    quantity: number;
  }>;
  estimatedDelivery?: Date;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
}

export interface Conversation {
  id: string;
  buyerId: string;
  sellerId: string;
}

export interface Payment {
  amount: number;
}

export interface WeeklyReportData {
  weekStartDate: Date;
  weekEndDate: Date;
  totalSales: number;
  totalRevenue: number;
  totalViews: number;
  totalMessages: number;
  topProducts: Array<{ 
    title: string;
    views: number;
    sales: number;
  }>;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findManyByIds(ids: string[]): Promise<User[]>;
}