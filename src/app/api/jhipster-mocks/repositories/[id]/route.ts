import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  apiMethod,
  badRequestResponse,
} from '@/app/api/jhipster-mocks/_helpers/api';
import {
  getRepositoryById,
  removeRepositoryById,
} from '@/app/api/jhipster-mocks/repositories/service';

export const GET = apiMethod({
  handler: async ({ params }) => {
    const safeParams = z.object({ id: z.string() }).safeParse(params);
    if (!safeParams.success) {
      return badRequestResponse();
    }
    const repository = await getRepositoryById(Number(safeParams.data.id));
    return NextResponse.json(repository);
  },
});

export const DELETE = apiMethod({
  handler: async ({ params }) => {
    const safeParams = z.object({ id: z.string() }).safeParse(params);
    if (!safeParams.success) {
      return badRequestResponse();
    }

    await removeRepositoryById(Number(safeParams.data.id));
    return new NextResponse('ok', { status: 200 });
  },
});
