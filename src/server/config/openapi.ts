import { generateOpenApiDocument } from 'trpc-openapi';

import { env } from '@/env.mjs';
import { appRouter } from '@/server/router';

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'API Documentation',
  description: 'OpenAPI compliant REST API built using tRPC with Next.js',
  version: '1.0.0',
  baseUrl: `${env.NEXT_PUBLIC_BASE_URL}/api/rest`,
});
