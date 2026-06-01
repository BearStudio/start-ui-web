import { handleRequest, type Router } from '@better-upload/server';
import { Result } from '@swan-io/boxed';
import { match, P } from 'ts-pattern';

import { getAuthUseCases } from '@/composition/auth';
import { getBookUseCases } from '@/composition/book';
import { getKernel } from '@/composition/kernel';
import { createBookCoverUploadRoute } from '@/modules/book/transport/upload/book-cover';
import { getStorageConfig } from '@/modules/kernel/infrastructure/config/storage';
import { getDefaultUploadClient } from '@/modules/kernel/infrastructure/storage/better-upload';
import { envClient } from '@/platform/env/client';

import { createCachedFactory } from './shared/singleton';

const createBookCoverRoute = () =>
  createBookCoverUploadRoute({
    getCurrentSession: async (headers) => {
      const result = await getAuthUseCases().getCurrentSession({ headers });
      return match(result)
        .with(Result.P.Error(P.select()), (error) => {
          throw error;
        })
        .with(
          Result.P.Ok({ type: 'auth_session_found', session: P.select() }),
          (session) => session
        )
        .with(Result.P.Ok({ type: 'auth_session_missing' }), () => null)
        .exhaustive();
    },
    getUseCases: getBookUseCases,
    logger: getKernel().logger,
  });

const createBookUploadRouter = () =>
  ({
    client: getDefaultUploadClient(),
    bucketName: getStorageConfig().bucketName,
    routes: {
      bookCover: createBookCoverRoute(),
    },
  }) as const satisfies Router;

const routerFactory = createCachedFactory(() => createBookUploadRouter());

export type UploadRoutes = keyof ReturnType<
  typeof createBookUploadRouter
>['routes'];

export const handleBookUploadRequest = (request: Request) => {
  if (envClient.VITE_IS_DEMO) {
    return new Response('Demo Mode', { status: 405 });
  }
  return handleRequest(request, routerFactory.get());
};
