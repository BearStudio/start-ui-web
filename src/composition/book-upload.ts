import { handleRequest, type Router } from '@better-upload/server';

import { getAuthUseCases } from '@/composition/auth';
import { getBookUseCases } from '@/composition/book';
import { createBookCoverUploadRoute } from '@/modules/book/transport/upload/book-cover';
import { env } from '@/modules/kernel/infrastructure/config/env';
import { getDefaultUploadClient } from '@/modules/kernel/infrastructure/storage/better-upload';

import { createCachedFactory } from './shared/singleton';

const createBookCoverRoute = () =>
  createBookCoverUploadRoute({
    getCurrentSession: (headers) =>
      getAuthUseCases().getCurrentSession({ headers }),
    getUseCases: getBookUseCases,
  });

const createBookUploadRouter = () =>
  ({
    client: getDefaultUploadClient(),
    bucketName: env.S3_BUCKET_NAME,
    routes: {
      bookCover: createBookCoverRoute(),
    },
  }) as const satisfies Router;

const routerFactory = createCachedFactory(() => createBookUploadRouter());

export type UploadRoutes = keyof ReturnType<
  typeof createBookUploadRouter
>['routes'];

export const handleBookUploadRequest = (request: Request) => {
  if (env.VITE_IS_DEMO) {
    return new Response('Demo Mode', { status: 405 });
  }
  return handleRequest(request, routerFactory.get());
};
