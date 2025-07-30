export type MessageEvent = {
  type: 'message';
  data: {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: Date;
  };
};

export type TypingEvent = {
  type: 'typing';
  data: {
    conversationId: string;
    userId: string;
    isTyping: boolean;
  };
};

export type NotificationEvent = {
  type: 'notification';
  data: {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'order' | 'message' | 'payment' | 'system';
    metadata?: Record<string, any>;
    read: boolean;
    createdAt: Date;
  };
};

export type PresenceEvent = {
  type: 'presence';
  data: {
    userId: string;
    status: 'online' | 'offline' | 'away';
    lastSeen?: Date;
  };
};

export type RealTimeEvent =
  | MessageEvent
  | TypingEvent
  | NotificationEvent
  | PresenceEvent;

export interface RealTimeConfig {
  pusherKey: string;
  pusherCluster: string;
  pusherAppId?: string;
  pusherSecret?: string;
  enablePresence?: boolean;
  enableTypingIndicators?: boolean;
}

export interface ChannelSubscription {
  channel: string;
  unsubscribe: () => void;
}

export interface RealTimeClient {
  subscribe(
    channel: string,
    event: string,
    callback: (data: any) => void
  ): ChannelSubscription;
  trigger(channel: string, event: string, data: any): void;
  presence: {
    subscribe(channel: string): Promise<void>;
    unsubscribe(channel: string): void;
    getMembers(channel: string): Map<string, any>;
  };
  disconnect(): void;
  getConnectionState(): string;
  onConnectionStateChange(callback: (state: string) => void): () => void;
}

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
