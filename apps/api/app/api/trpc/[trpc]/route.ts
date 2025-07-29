import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { NextRequest } from 'next/server';
import { appRouter } from '../../../../lib/trpc/routers/_app';
import { createTRPCContext } from '../../../../lib/trpc/config';
import { logError } from '@repo/observability/server';

const handler = async (req: NextRequest) => {
  const startTime = Date.now();
  
  try {
    return await fetchRequestHandler({
      endpoint: '/api/trpc',
      req,
      router: appRouter,
      createContext: () => createTRPCContext({ req }),
      onError: ({ error, path }) => {
        logError(`tRPC error on ${path ?? '<no-path>'}: ${error.message}`, error);
      },
    });
  } catch (error) {
    logError('tRPC handler error:', error);
    return new Response('Internal Server Error', { status: 500 });
  } finally {
    const duration = Date.now() - startTime;
    console.log('tRPC request completed', { 
      method: req.method,
      url: req.url,
      duration 
    });
  }
};

export { handler as GET, handler as POST };