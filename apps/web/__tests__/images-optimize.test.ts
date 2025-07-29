import { cache } from '@repo/database';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ImageOptimizationService } from '../lib/image-optimization';
import { GET } from '../app/api/images/optimize/route';

// Mock dependencies
vi.mock('@repo/database');
vi.mock('../lib/image-optimization', () => ({
  ImageOptimizationService: {
    optimizeImage: vi.fn(),
  },
}));

// Mock global fetch
global.fetch = vi.fn();

describe('GET /api/images/optimize', () => {
  const mockImageBuffer = Buffer.from('fake-image-data');
  const mockOptimizedImage = {
    data: Buffer.from('optimized-image-data'),
    contentType: 'image/webp',
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000',
      'Content-Length': '12345',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Query Parameter Validation', () => {
    it('should validate URL parameter is required', async () => {
      const request = new Request('http://localhost:3000/api/images/optimize');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid parameters' });
    });

    it('should validate URL parameter is valid URL', async () => {
      const request = new Request('http://localhost:3000/api/images/optimize?url=not-a-url');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid parameters' });
    });

    it('should accept valid URL', async () => {
      vi.mocked(cache.get).mockResolvedValueOnce(null);
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockImageBuffer.buffer),
      } as Response);
      vi.mocked(ImageOptimizationService.optimizeImage).mockResolvedValueOnce(mockOptimizedImage);
      vi.mocked(cache.set).mockResolvedValueOnce(undefined);

      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/image.jpg');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('should validate width parameter as number', async () => {
      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/image.jpg&w=abc');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid parameters' });
    });

    it('should validate height parameter as number', async () => {
      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/image.jpg&h=xyz');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid parameters' });
    });

    it('should validate quality parameter range', async () => {
      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/image.jpg&q=150');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid parameters' });
    });

    it('should validate format parameter enum', async () => {
      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/image.jpg&f=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid parameters' });
    });
  });

  describe('Cache Functionality', () => {
    beforeEach(() => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockImageBuffer.buffer),
      } as Response);
      vi.mocked(ImageOptimizationService.optimizeImage).mockResolvedValue(mockOptimizedImage);
    });

    it('should check cache before fetching image', async () => {
      const cachedData = {
        data: 'Y2FjaGVkLWltYWdlLWRhdGE=', // base64 encoded
        contentType: 'image/webp',
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000',
        },
      };

      vi.mocked(cache.get).mockResolvedValueOnce(cachedData);

      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/image.jpg');
      const response = await GET(request);

      expect(cache.get).toHaveBeenCalledWith('optimized_image:https://example.com/image.jpg:undefined:undefined:undefined:undefined');
      expect(fetch).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('image/webp');
    });

    it('should generate correct cache key with all parameters', async () => {
      vi.mocked(cache.get).mockResolvedValueOnce(null);
      vi.mocked(cache.set).mockResolvedValueOnce(undefined);

      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/image.jpg&w=300&h=200&q=80&f=webp');
      await GET(request);

      expect(cache.get).toHaveBeenCalledWith('optimized_image:https://example.com/image.jpg:300:200:80:webp');
    });

    it('should cache optimized image after processing', async () => {
      vi.mocked(cache.get).mockResolvedValueOnce(null);
      vi.mocked(cache.set).mockResolvedValueOnce(undefined);

      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/image.jpg');
      await GET(request);

      expect(cache.set).toHaveBeenCalledWith(
        'optimized_image:https://example.com/image.jpg:undefined:undefined:undefined:undefined',
        {
          data: mockOptimizedImage.data.toString('base64'),
          contentType: 'image/webp',
          headers: mockOptimizedImage.headers,
        },
        { ttl: 60 * 60 * 24 * 7 } // 7 days
      );
    });
  });

  describe('Image Fetching', () => {
    beforeEach(() => {
      vi.mocked(cache.get).mockResolvedValue(null);
      vi.mocked(ImageOptimizationService.optimizeImage).mockResolvedValue(mockOptimizedImage);
      vi.mocked(cache.set).mockResolvedValue(undefined);
    });

    it('should fetch image from URL', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockImageBuffer.buffer),
      } as Response);

      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/image.jpg');
      await GET(request);

      expect(fetch).toHaveBeenCalledWith('https://example.com/image.jpg', {
        headers: {
          'User-Agent': 'Threadly Image Optimizer',
        },
      });
    });

    it('should handle fetch errors', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/not-found.jpg');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Failed to fetch image' });
    });

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/image.jpg');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });
  });

  describe('Image Optimization', () => {
    beforeEach(() => {
      vi.mocked(cache.get).mockResolvedValue(null);
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockImageBuffer.buffer),
      } as Response);
      vi.mocked(cache.set).mockResolvedValue(undefined);
    });

    it('should pass correct parameters to optimization service', async () => {
      vi.mocked(ImageOptimizationService.optimizeImage).mockResolvedValueOnce(mockOptimizedImage);

      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/image.jpg&w=300&h=200&q=80&f=webp');
      await GET(request);

      expect(ImageOptimizationService.optimizeImage).toHaveBeenCalledWith(
        mockImageBuffer,
        {
          width: 300,
          height: 200,
          quality: 80,
          format: 'webp',
        }
      );
    });

    it('should handle optimization errors', async () => {
      vi.mocked(ImageOptimizationService.optimizeImage).mockRejectedValueOnce(
        new Error('Optimization failed')
      );

      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/image.jpg');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });

    it('should return optimized image with correct headers', async () => {
      vi.mocked(ImageOptimizationService.optimizeImage).mockResolvedValueOnce(mockOptimizedImage);

      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/image.jpg');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('image/webp');
      expect(response.headers.get('Cache-Control')).toBe('public, max-age=31536000');
      expect(response.headers.get('Content-Length')).toBe('12345');
    });
  });

  describe('Format Support', () => {
    beforeEach(() => {
      vi.mocked(cache.get).mockResolvedValue(null);
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockImageBuffer.buffer),
      } as Response);
      vi.mocked(cache.set).mockResolvedValue(undefined);
    });

    it('should support webp format', async () => {
      vi.mocked(ImageOptimizationService.optimizeImage).mockResolvedValueOnce({
        ...mockOptimizedImage,
        contentType: 'image/webp',
      });

      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/image.jpg&f=webp');
      const response = await GET(request);

      expect(response.headers.get('Content-Type')).toBe('image/webp');
    });

    it('should support avif format', async () => {
      vi.mocked(ImageOptimizationService.optimizeImage).mockResolvedValueOnce({
        ...mockOptimizedImage,
        contentType: 'image/avif',
      });

      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/image.jpg&f=avif');
      const response = await GET(request);

      expect(response.headers.get('Content-Type')).toBe('image/avif');
    });

    it('should support original format', async () => {
      vi.mocked(ImageOptimizationService.optimizeImage).mockResolvedValueOnce({
        ...mockOptimizedImage,
        contentType: 'image/jpeg',
      });

      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/image.jpg&f=original');
      const response = await GET(request);

      expect(ImageOptimizationService.optimizeImage).toHaveBeenCalledWith(
        mockImageBuffer,
        expect.objectContaining({ format: 'original' })
      );
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      vi.mocked(cache.get).mockResolvedValue(null);
      vi.mocked(cache.set).mockResolvedValue(undefined);
    });

    it('should handle very large images', async () => {
      const largeBuffer = Buffer.alloc(50 * 1024 * 1024); // 50MB
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(largeBuffer.buffer),
      } as Response);
      vi.mocked(ImageOptimizationService.optimizeImage).mockResolvedValueOnce(mockOptimizedImage);

      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/large.jpg');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('should handle empty image response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      } as Response);

      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/empty.jpg');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });

    it('should handle special characters in URL', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockImageBuffer.buffer),
      } as Response);
      vi.mocked(ImageOptimizationService.optimizeImage).mockResolvedValueOnce(mockOptimizedImage);

      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/image%20with%20spaces.jpg');
      await GET(request);

      expect(fetch).toHaveBeenCalledWith('https://example.com/image%20with%20spaces.jpg', expect.any(Object));
    });

    it('should handle zero quality parameter', async () => {
      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/image.jpg&q=0');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid parameters' });
    });

    it('should handle negative dimensions', async () => {
      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/image.jpg&w=-100&h=-200');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid parameters' });
    });
  });

  describe('Performance', () => {
    beforeEach(() => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockImageBuffer.buffer),
      } as Response);
      vi.mocked(ImageOptimizationService.optimizeImage).mockResolvedValue(mockOptimizedImage);
      vi.mocked(cache.set).mockResolvedValue(undefined);
    });

    it('should serve cached images quickly', async () => {
      const cachedData = {
        data: mockOptimizedImage.data.toString('base64'),
        contentType: 'image/webp',
        headers: mockOptimizedImage.headers,
      };

      vi.mocked(cache.get).mockResolvedValueOnce(cachedData);

      const startTime = Date.now();
      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/image.jpg');
      await GET(request);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(50); // Should be very fast for cached responses
      expect(ImageOptimizationService.optimizeImage).not.toHaveBeenCalled();
    });

    it('should handle concurrent requests for same image', async () => {
      vi.mocked(cache.get).mockResolvedValue(null);

      const requests = Array(5).fill(null).map(() => 
        new Request('http://localhost:3000/api/images/optimize?url=https://example.com/same-image.jpg')
      );

      const responses = await Promise.all(requests.map(req => GET(req)));

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // All requests should result in the same number of fetch calls
      expect(fetch).toHaveBeenCalledTimes(5);
    });
  });

  describe('Security', () => {
    beforeEach(() => {
      vi.mocked(cache.get).mockResolvedValue(null);
      vi.mocked(cache.set).mockResolvedValue(undefined);
    });

    it('should include user agent header when fetching', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockImageBuffer.buffer),
      } as Response);
      vi.mocked(ImageOptimizationService.optimizeImage).mockResolvedValueOnce(mockOptimizedImage);

      const request = new Request('http://localhost:3000/api/images/optimize?url=https://example.com/image.jpg');
      await GET(request);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': 'Threadly Image Optimizer',
          }),
        })
      );
    });

    it('should handle malformed URLs gracefully', async () => {
      const request = new Request('http://localhost:3000/api/images/optimize?url=javascript:alert(1)');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid parameters' });
    });
  });
});