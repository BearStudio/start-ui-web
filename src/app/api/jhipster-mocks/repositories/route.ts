import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  apiMethod,
  badRequestResponse,
} from '@/app/api/jhipster-mocks/_helpers/api';
import { repositoryErrorResponse } from '@/app/api/jhipster-mocks/_helpers/repository';
import {
  createRepository,
  getRepositoryList,
  updateRepositoryById,
} from '@/app/api/jhipster-mocks/repositories/service';

export const GET = apiMethod({
  handler: async ({ searchParams }) => {
    const options = z
      .object({
        page: z.string().optional().default('0').transform(Number),
        size: z.string().optional().default('10').transform(Number),
      })
      .default({ page: '0', size: '10' })
      .parse({
        page: searchParams.get('page'),
        size: searchParams.get('size'),
      });
    const { repositories, total } = await getRepositoryList({
      skip: options.page * options.size,
      take: options.size,
    });
    const headers = new Headers();
    headers.set('x-total-count', total.toString());

    return NextResponse.json(repositories, { headers });
  },
});

export const POST = apiMethod({
  handler: async ({ req }) => {
    const bodyParsed = z
      .object({
        name: z.string(),
        link: z.string(),
        description: z.string().nullable(),
      })
      .safeParse(await req.json());

    if (!bodyParsed.success) {
      return badRequestResponse();
    }

    let repository;
    try {
      repository = await createRepository(bodyParsed.data);
    } catch (e) {
      return repositoryErrorResponse(e);
    }

    return NextResponse.json(repository);
  },
});

export const PUT = apiMethod({
  handler: async ({ req }) => {
    const bodyParsed = z
      .object({
        id: z.number(),
        name: z.string(),
        link: z.string(),
        description: z.string().nullable(),
      })
      .safeParse(await req.json());

    if (!bodyParsed.success) {
      return badRequestResponse();
    }

    let repository;
    try {
      repository = await updateRepositoryById(
        bodyParsed.data.id,
        bodyParsed.data
      );
    } catch (e) {
      return repositoryErrorResponse(e);
    }

    return NextResponse.json(repository);
  },
});
