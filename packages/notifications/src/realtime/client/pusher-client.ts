import { withRetry } from '@repo/utils/error-handling';
import Pusher, { type Channel, type PresenceChannel } from 'pusher-js';
import type {
  ChannelSubscription,
  RealTimeClient,
  RealTimeConfig,
} from '../types';

export class PusherClient implements RealTimeClient {
  private pusher: Pusher;
  private channels: Map<string, Channel> = new Map();
  private presenceChannels: Map<string, PresenceChannel> = new Map();

  constructor(config: RealTimeConfig) {
    this.pusher = new Pusher(config.pusherKey, {
      cluster: config.pusherCluster,
      authEndpoint: '/api/real-time/auth',
      auth: {
        headers: {
          'Content-Type': 'application/json',
        },
      },
      enabledTransports: ['ws', 'wss'],
    });

    // Connection state monitoring
    this.pusher.connection.bind('connected', () => {});

    this.pusher.connection.bind('error', (_err: any) => {});
  }

  subscribe(
    channelName: string,
    event: string,
    callback: (data: any) => void
  ): ChannelSubscription {
    let channel = this.channels.get(channelName);

    if (!channel) {
      channel = this.pusher.subscribe(channelName);
      this.channels.set(channelName, channel);
    }

    channel.bind(event, callback);

    return {
      channel: channelName,
      unsubscribe: () => {
        channel?.unbind(event, callback);
        if (channel && !(channel as any).callbacks?.size) {
          this.pusher.unsubscribe(channelName);
          this.channels.delete(channelName);
        }
      },
    };
  }

  trigger(channel: string, event: string, data: any): void {
    // Client-side triggering is handled via API calls
    // This method exists for interface compatibility
    withRetry(
      async () => {
        const response = await fetch('/api/real-time/trigger', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ channel, event, data }),
        });

        if (!response.ok) {
          throw new Error(`Failed to trigger event: ${response.statusText}`);
        }
      },
      { retries: 3, minTimeout: 1000 }
    );
  }

  presence = {
    subscribe: async (channelName: string): Promise<void> => {
      const channel = this.pusher.subscribe(channelName) as PresenceChannel;
      this.presenceChannels.set(channelName, channel);

      return new Promise((resolve) => {
        channel.bind('pusher:subscription_succeeded', () => {
          resolve();
        });
      });
    },

    unsubscribe: (channelName: string): void => {
      const channel = this.presenceChannels.get(channelName);
      if (channel) {
        this.pusher.unsubscribe(channelName);
        this.presenceChannels.delete(channelName);
      }
    },

    getMembers: (channelName: string): Map<string, any> => {
      const channel = this.presenceChannels.get(channelName);
      if (!channel) {
        return new Map();
      }
      return new Map(Object.entries(channel.members.members));
    },
  };

  disconnect(): void {
    this.pusher.disconnect();
    this.channels.clear();
    this.presenceChannels.clear();
  }

  // Helper method to get connection state
  getConnectionState(): string {
    return this.pusher.connection.state;
  }

  // Helper to bind to connection events
  onConnectionStateChange(callback: (state: string) => void): () => void {
    const handler = ({ current }: { current: string }) => callback(current);
    this.pusher.connection.bind('state_change', handler);

    return () => {
      this.pusher.connection.unbind('state_change', handler);
    };
  }
}
