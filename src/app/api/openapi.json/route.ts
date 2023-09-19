import { NextResponse } from 'next/server';
import { generateOpenApiDocument } from 'trpc-openapi';

import { appRouter } from '@/server/api/root';

export const openApiDocument = generateOpenApiDocument(appRouter as any, {
  title: 'Example CRUD API',
  description: 'OpenAPI compliant REST API built using tRPC with Next.js',
  version: '1.0.0',
  baseUrl: 'http://localhost:3000/api/rest',
  docsUrl: 'https://github.com/jlalmes/trpc-openapi',
  tags: ['auth', 'users', 'posts'],
});

export function GET() {
  return NextResponse.json(openApiDocument);
}
