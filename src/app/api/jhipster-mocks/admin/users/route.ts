import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  createUser,
  getUserList,
  updateUserById,
} from '@/app/api/jhipster-mocks/admin/users/service';
import {
  apiMethod,
  badRequestResponse,
} from '@/app/api/jhipster-mocks/helpers';

export const GET = apiMethod({
  admin: true,
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
    const { users, total } = await getUserList({
      skip: options.page * options.size,
      take: options.size,
    });
    const headers = new Headers();
    headers.set('x-total-count', total.toString());
    return NextResponse.json(users, { headers });
  },
});

export const POST = apiMethod({
  admin: true,
  handler: async ({ req }) => {
    const bodyParsed = z
      .object({
        login: z.string().min(2),
        email: z.string().email(),
        firstName: z.string().nullable(),
        lastName: z.string().nullable(),
        langKey: z.string(),
        authorities: z.array(z.string()),
        activated: z.boolean().optional(),
      })
      .safeParse(await req.json());

    if (!bodyParsed.success) {
      return badRequestResponse();
    }

    const user = await createUser({ activated: true, ...bodyParsed.data });
    return NextResponse.json(user);
  },
});
export const PUT = apiMethod({
  admin: true,
  handler: async ({ req }) => {
    const bodyParsed = z
      .object({
        id: z.number(),
        login: z.string().min(2),
        email: z.string().email(),
        firstName: z.string().nullable(),
        lastName: z.string().nullable(),
        langKey: z.string(),
        authorities: z.array(z.string()),
        activated: z.boolean().optional(),
      })
      .safeParse(await req.json());

    if (!bodyParsed.success) {
      return badRequestResponse();
    }

    const user = await updateUserById(bodyParsed.data.id, bodyParsed.data);
    return NextResponse.json(user);
  },
});
