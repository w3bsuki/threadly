import type { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '../errors/api-error';

export type ApiVersion = 'v1' | 'v2' | 'v3';

export interface VersionConfig {
  defaultVersion: ApiVersion;
  supportedVersions: ApiVersion[];
  deprecatedVersions?: ApiVersion[];
  versionExtractor?: (req: NextRequest) => ApiVersion | null;
  onDeprecatedVersion?: (version: ApiVersion, req: NextRequest) => void;
}

export class ApiVersioning {
  private config: Required<VersionConfig>;

  constructor(config: VersionConfig) {
    this.config = {
      deprecatedVersions: [],
      versionExtractor: this.defaultVersionExtractor,
      onDeprecatedVersion: this.defaultDeprecationHandler,
      ...config,
    };
  }

  private defaultVersionExtractor(req: NextRequest): ApiVersion | null {
    // 1. Check Accept header
    const acceptHeader = req.headers.get('accept');
    if (acceptHeader) {
      const versionMatch = acceptHeader.match(
        /application\/vnd\.threadly\.(\w+)\+json/
      );
      if (versionMatch) {
        return versionMatch[1] as ApiVersion;
      }
    }

    // 2. Check X-API-Version header
    const versionHeader = req.headers.get('x-api-version');
    if (versionHeader) {
      return versionHeader as ApiVersion;
    }

    // 3. Check URL path
    const pathname = new URL(req.url).pathname;
    const pathMatch = pathname.match(/^\/api\/(v\d+)/);
    if (pathMatch) {
      return pathMatch[1] as ApiVersion;
    }

    return null;
  }

  private defaultDeprecationHandler(
    version: ApiVersion,
    req: NextRequest
  ): void {
    console.warn(`Deprecated API version ${version} used`, {
      url: req.url,
      userAgent: req.headers.get('user-agent'),
    });
  }

  getVersion(req: NextRequest): ApiVersion {
    const version = this.config.versionExtractor(req);

    if (!version) {
      return this.config.defaultVersion;
    }

    if (!this.config.supportedVersions.includes(version)) {
      throw ApiError.badRequest(`API version ${version} is not supported`);
    }

    return version;
  }

  middleware(
    req: NextRequest,
    next: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    const version = this.getVersion(req);

    if (this.config.deprecatedVersions?.includes(version)) {
      this.config.onDeprecatedVersion(version, req);
    }

    return next().then((response) => {
      response.headers.set('X-API-Version', version);

      if (this.config.deprecatedVersions?.includes(version)) {
        const latestVersion =
          this.config.supportedVersions[
            this.config.supportedVersions.length - 1
          ];
        response.headers.set('X-API-Deprecation', 'true');
        response.headers.set('X-API-Latest-Version', latestVersion);
        response.headers.set(
          'X-API-Deprecation-Date',
          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        );
      }

      return response;
    });
  }

  createRouter<T extends Record<ApiVersion, any>>(handlers: T) {
    return async (req: NextRequest, params: any): Promise<NextResponse> => {
      const version = this.getVersion(req);
      const handler = handlers[version];

      if (!handler) {
        throw ApiError.badRequest(
          `Handler not implemented for API version ${version}`
        );
      }

      return handler(req, params);
    };
  }
}

export const createVersionedApi = (config: VersionConfig) => {
  return new ApiVersioning(config);
};

export const defaultVersionConfig: VersionConfig = {
  defaultVersion: 'v1',
  supportedVersions: ['v1', 'v2'],
  deprecatedVersions: [],
};

export const withApiVersion = (
  handler: (
    req: NextRequest,
    params: any,
    version: ApiVersion
  ) => Promise<NextResponse>,
  config: VersionConfig = defaultVersionConfig
) => {
  const versioning = new ApiVersioning(config);

  return async (req: NextRequest, params: any): Promise<NextResponse> => {
    return versioning.middleware(req, async () => {
      const version = versioning.getVersion(req);
      return handler(req, params, version);
    });
  };
};

export interface VersionedEndpoint<T = any> {
  v1?: (req: NextRequest, params: T) => Promise<NextResponse>;
  v2?: (req: NextRequest, params: T) => Promise<NextResponse>;
  v3?: (req: NextRequest, params: T) => Promise<NextResponse>;
}

export const createVersionedEndpoint = <T = any>(
  endpoints: VersionedEndpoint<T>,
  config: VersionConfig = defaultVersionConfig
) => {
  const versioning = new ApiVersioning(config);

  return async (req: NextRequest, params: T): Promise<NextResponse> => {
    const version = versioning.getVersion(req);
    const handler = endpoints[version];

    if (!handler) {
      throw ApiError.badRequest(
        `Endpoint not available in API version ${version}`
      );
    }

    return versioning.middleware(req, () => handler(req, params));
  };
};
