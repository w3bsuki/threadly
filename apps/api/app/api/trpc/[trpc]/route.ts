import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { NextRequest } from 'next/server';
import { appRouter } from '../../../../lib/trpc/routers/_app';
import { createTRPCContext } from '../../../../lib/trpc/config';
import { log, logError } from '@repo/observability/server';

const handler = async (req: NextRequest) => {
  const startTime = Date.now();
  
  try {
    return await fetchRequestHandler({
      endpoint: '/api/trpc',
      req,
      router: appRouter,
      createContext: () => createTRPCContext({ req }),
      onError: ({ error, path, type }) => {
        logError(`tRPC error on ${path ?? '<no-path>'}:`, error, {
          type,
          path,
          code: error.code,
          stack: error.stack,
        });
      },
    });
  } catch (error) {
    logError('tRPC handler error:', error);
    return new Response('Internal Server Error', { status: 500 });
  } finally {
    const duration = Date.now() - startTime;
    log('tRPC request completed', { 
      method: req.method,
      url: req.url,
      duration 
    });
  }
};

export { handler as GET, handler as POST };