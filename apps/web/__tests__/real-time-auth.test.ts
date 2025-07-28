import { currentUser } from '@repo/auth/server';
import { getPusherServer } from '@repo/real-time/src/server/pusher-server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../app/api/real-time/auth/route';

// Mock dependencies
vi.mock('@repo/auth/server');
vi.mock('@repo/real-time/src/server/pusher-server');

describe('POST /api/real-time/auth', () => {
  const mockUser = {
    id: 'user_123',
    email: 'test@example.com',
  };

  const mockPusherServer = {
    authenticateUser: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPusherServer).mockReturnValue(mockPusherServer as any);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      vi.mocked(currentUser).mockResolvedValueOnce(null);

      const request = new Request('http://localhost:3000/api/real-time/auth', {
        method: 'POST',
        body: 'socket_id=123.456&channel_name=presence-chat',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should authenticate valid users', async () => {
      vi.mocked(currentUser).mockResolvedValueOnce(mockUser as any);
      mockPusherServer.authenticateUser.mockResolvedValueOnce({
        auth: 'pusher_auth_token',
        channel_data: JSON.stringify({ user_id: 'user_123' }),
      });

      const request = new Request('http://localhost:3000/api/real-time/auth', {
        method: 'POST',
        body: 'socket_id=123.456&channel_name=presence-chat',
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Request Validation', () => {
    beforeEach(() => {
      vi.mocked(currentUser).mockResolvedValue(mockUser as any);
    });

    it('should return 400 if socket_id is missing', async () => {
      const request = new Request('http://localhost:3000/api/real-time/auth', {
        method: 'POST',
        body: 'channel_name=presence-chat',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Missing socket_id or channel_name' });
    });

    it('should return 400 if channel_name is missing', async () => {
      const request = new Request('http://localhost:3000/api/real-time/auth', {
        method: 'POST',
        body: 'socket_id=123.456',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Missing socket_id or channel_name' });
    });

    it('should return 400 if both parameters are missing', async () => {
      const request = new Request('http://localhost:3000/api/real-time/auth', {
        method: 'POST',
        body: '',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Missing socket_id or channel_name' });
    });

    it('should handle URL encoded form data', async () => {
      mockPusherServer.authenticateUser.mockResolvedValueOnce({
        auth: 'pusher_auth_token',
      });

      const request = new Request('http://localhost:3000/api/real-time/auth', {
        method: 'POST',
        body: 'socket_id=123.456&channel_name=presence-chat',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockPusherServer.authenticateUser).toHaveBeenCalledWith(
        '123.456',
        'presence-chat',
        'user_123'
      );
    });
  });

  describe('Pusher Authentication', () => {
    beforeEach(() => {
      vi.mocked(currentUser).mockResolvedValue(mockUser as any);
    });

    it('should call pusher authenticateUser with correct parameters', async () => {
      mockPusherServer.authenticateUser.mockResolvedValueOnce({
        auth: 'pusher_auth_token',
        channel_data: JSON.stringify({ user_id: 'user_123' }),
      });

      const request = new Request('http://localhost:3000/api/real-time/auth', {
        method: 'POST',
        body: 'socket_id=123.456&channel_name=presence-chat',
      });

      await POST(request);

      expect(mockPusherServer.authenticateUser).toHaveBeenCalledWith(
        '123.456',
        'presence-chat',
        'user_123'
      );
    });

    it('should return pusher auth response', async () => {
      const mockAuthResponse = {
        auth: 'pusher_auth_token_12345',
        channel_data: JSON.stringify({ 
          user_id: 'user_123',
          user_info: { name: 'Test User' }
        }),
      };

      mockPusherServer.authenticateUser.mockResolvedValueOnce(mockAuthResponse);

      const request = new Request('http://localhost:3000/api/real-time/auth', {
        method: 'POST',
        body: 'socket_id=123.456&channel_name=presence-chat',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockAuthResponse);
    });

    it('should handle different channel types', async () => {
      mockPusherServer.authenticateUser.mockResolvedValueOnce({
        auth: 'pusher_auth_token',
      });

      const channels = [
        'presence-chat',
        'private-notifications',
        'presence-room-123',
        'private-user-user_123',
      ];

      for (const channel of channels) {
        vi.clearAllMocks();
        mockPusherServer.authenticateUser.mockResolvedValueOnce({
          auth: 'pusher_auth_token',
        });

        const request = new Request('http://localhost:3000/api/real-time/auth', {
          method: 'POST',
          body: `socket_id=123.456&channel_name=${channel}`,
        });

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockPusherServer.authenticateUser).toHaveBeenCalledWith(
          '123.456',
          channel,
          'user_123'
        );
      }
    });
  });

  describe('Environment Configuration', () => {
    beforeEach(() => {
      vi.mocked(currentUser).mockResolvedValue(mockUser as any);
    });

    it('should use environment variables for pusher configuration', async () => {
      const originalEnv = process.env;
      
      process.env = {
        ...originalEnv,
        PUSHER_APP_ID: 'test_app_id',
        PUSHER_KEY: 'test_key',
        PUSHER_SECRET: 'test_secret',
        PUSHER_CLUSTER: 'test_cluster',
      };

      mockPusherServer.authenticateUser.mockResolvedValueOnce({
        auth: 'pusher_auth_token',
      });

      const request = new Request('http://localhost:3000/api/real-time/auth', {
        method: 'POST',
        body: 'socket_id=123.456&channel_name=presence-chat',
      });

      await POST(request);

      expect(getPusherServer).toHaveBeenCalledWith({
        pusherAppId: 'test_app_id',
        pusherKey: 'test_key',
        pusherSecret: 'test_secret',
        pusherCluster: 'test_cluster',
      });

      process.env = originalEnv;
    });

    it('should handle missing environment variables', async () => {
      const originalEnv = process.env;
      
      process.env = {
        ...originalEnv,
        PUSHER_APP_ID: undefined,
        PUSHER_KEY: undefined,
        PUSHER_SECRET: undefined,
        PUSHER_CLUSTER: undefined,
      };

      mockPusherServer.authenticateUser.mockResolvedValueOnce({
        auth: 'pusher_auth_token',
      });

      const request = new Request('http://localhost:3000/api/real-time/auth', {
        method: 'POST',
        body: 'socket_id=123.456&channel_name=presence-chat',
      });

      await POST(request);

      expect(getPusherServer).toHaveBeenCalledWith({
        pusherAppId: '',
        pusherKey: '',
        pusherSecret: '',
        pusherCluster: '',
      });

      process.env = originalEnv;
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(currentUser).mockResolvedValue(mockUser as any);
    });

    it('should handle pusher authentication errors', async () => {
      mockPusherServer.authenticateUser.mockRejectedValueOnce(
        new Error('Pusher authentication failed')
      );

      const request = new Request('http://localhost:3000/api/real-time/auth', {
        method: 'POST',
        body: 'socket_id=123.456&channel_name=presence-chat',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to authenticate' });
    });

    it('should handle invalid request body', async () => {
      const request = new Request('http://localhost:3000/api/real-time/auth', {
        method: 'POST',
        body: 'invalid=body&format',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Missing socket_id or channel_name' });
    });

    it('should handle request parsing errors', async () => {
      const request = new Request('http://localhost:3000/api/real-time/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{"invalid": "json"',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to authenticate' });
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      vi.mocked(currentUser).mockResolvedValue(mockUser as any);
      mockPusherServer.authenticateUser.mockResolvedValue({
        auth: 'pusher_auth_token',
      });
    });

    it('should handle special characters in socket_id', async () => {
      const request = new Request('http://localhost:3000/api/real-time/auth', {
        method: 'POST',
        body: 'socket_id=123.456-789:abc&channel_name=presence-chat',
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockPusherServer.authenticateUser).toHaveBeenCalledWith(
        '123.456-789:abc',
        'presence-chat',
        'user_123'
      );
    });

    it('should handle URL encoded channel names', async () => {
      const request = new Request('http://localhost:3000/api/real-time/auth', {
        method: 'POST',
        body: 'socket_id=123.456&channel_name=presence-chat%20room',
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockPusherServer.authenticateUser).toHaveBeenCalledWith(
        '123.456',
        'presence-chat room',
        'user_123'
      );
    });

    it('should handle empty response from pusher', async () => {
      mockPusherServer.authenticateUser.mockResolvedValueOnce({});

      const request = new Request('http://localhost:3000/api/real-time/auth', {
        method: 'POST',
        body: 'socket_id=123.456&channel_name=presence-chat',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({});
    });

    it('should handle additional form parameters', async () => {
      const request = new Request('http://localhost:3000/api/real-time/auth', {
        method: 'POST',
        body: 'socket_id=123.456&channel_name=presence-chat&extra_param=ignored',
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockPusherServer.authenticateUser).toHaveBeenCalledWith(
        '123.456',
        'presence-chat',
        'user_123'
      );
    });
  });
});