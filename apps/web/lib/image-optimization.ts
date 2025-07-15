const sharp = require('sharp');

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'original';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export class ImageOptimizationService {
  private static readonly DEFAULT_QUALITY = {
    webp: 85,
    avif: 80,
    jpeg: 85,
    png: 90,
  };

  private static readonly MAX_AGE = 60 * 60 * 24 * 365; // 1 year

  static async optimizeImage(
    buffer: Buffer,
    options: ImageOptimizationOptions = {}
  ): Promise<{ data: Buffer; contentType: string; headers: Record<string, string> }> {
    const {
      width,
      height,
      quality,
      format = 'webp',
      fit = 'cover',
    } = options;

    let pipeline = sharp(buffer);

    // Get image metadata
    const metadata = await pipeline.metadata();
    const originalFormat = metadata.format || 'jpeg';

    // Resize if dimensions provided
    if (width || height) {
      pipeline = pipeline.resize({
        width,
        height,
        fit,
        withoutEnlargement: true,
      });
    }

    // Convert format
    let outputBuffer: Buffer;
    let contentType: string;

    switch (format) {
      case 'avif':
        outputBuffer = await pipeline
          .avif({
            quality: quality || this.DEFAULT_QUALITY.avif,
            effort: 4, // Balance between speed and compression
          })
          .toBuffer();
        contentType = 'image/avif';
        break;

      case 'webp':
        outputBuffer = await pipeline
          .webp({
            quality: quality || this.DEFAULT_QUALITY.webp,
            effort: 4,
          })
          .toBuffer();
        contentType = 'image/webp';
        break;

      default:
        // Keep original format
        if (originalFormat === 'jpeg' || originalFormat === 'jpg') {
          outputBuffer = await pipeline
            .jpeg({
              quality: quality || this.DEFAULT_QUALITY.jpeg,
              mozjpeg: true,
            })
            .toBuffer();
          contentType = 'image/jpeg';
        } else if (originalFormat === 'png') {
          outputBuffer = await pipeline
            .png({
              quality: quality || this.DEFAULT_QUALITY.png,
              compressionLevel: 9,
            })
            .toBuffer();
          contentType = 'image/png';
        } else {
          outputBuffer = await pipeline.toBuffer();
          contentType = `image/${originalFormat}`;
        }
    }

    // Generate cache headers
    const headers = {
      'Content-Type': contentType,
      'Cache-Control': `public, max-age=${this.MAX_AGE}, immutable`,
      'X-Content-Type-Options': 'nosniff',
    };

    return {
      data: outputBuffer,
      contentType,
      headers,
    };
  }

  static generateSrcSet(
    baseUrl: string,
    sizes: number[] = [640, 750, 828, 1080, 1200, 1920]
  ): string {
    return sizes
      .map((size) => `${baseUrl}?w=${size} ${size}w`)
      .join(', ');
  }

  static generatePictureSources(
    baseUrl: string,
    sizes: number[] = [640, 750, 828, 1080, 1200, 1920]
  ): Array<{ srcSet: string; type: string }> {
    return [
      {
        srcSet: sizes.map((size) => `${baseUrl}?w=${size}&f=avif ${size}w`).join(', '),
        type: 'image/avif',
      },
      {
        srcSet: sizes.map((size) => `${baseUrl}?w=${size}&f=webp ${size}w`).join(', '),
        type: 'image/webp',
      },
    ];
  }

  static calculateAspectRatio(width: number, height: number): string {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    return `${width / divisor}/${height / divisor}`;
  }

  static async generateBlurPlaceholder(
    buffer: Buffer,
    size: number = 40
  ): Promise<string> {
    const blurredBuffer = await sharp(buffer)
      .resize(size, size, { fit: 'inside' })
      .blur(20)
      .toBuffer();

    return `data:image/jpeg;base64,${blurredBuffer.toString('base64')}`;
  }
}