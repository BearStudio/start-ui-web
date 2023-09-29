import { generateOpenApiDocument } from 'trpc-openapi';

import { env } from '@/env.mjs';
import { appRouter } from '@/server/api/root';

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Start UI API',
  description: 'OpenAPI compliant REST API built using tRPC with Next.js',
  version: '1.0.0',
  baseUrl: `${env.NEXT_PUBLIC_BASE_URL}/api/rest`,
});
