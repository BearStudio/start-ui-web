import { NextResponse } from 'next/server';

import { openApiDocument } from '@/server/api/openapi';

export function GET() {
  return NextResponse.json(openApiDocument);
}
