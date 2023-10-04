import { NextResponse } from 'next/server';

import { openApiDocument } from '@/server/config/openapi';

export function GET() {
  return NextResponse.json(openApiDocument);
}
