import { handleRequest, type Router } from '@better-upload/server';

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
    getCurrentSession: (headers) =>
      getAuthUseCases().getCurrentSession({ headers }),
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
