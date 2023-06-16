import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  apiMethod,
  badRequestResponse,
} from '@/app/api/jhipster-mocks/_helpers/api';
import { db } from '@/app/api/jhipster-mocks/_helpers/db';

export const POST = apiMethod({
  demo: 'allowed',
  public: true,
  handler: async ({ req }) => {
    const bodyParsed = z
      .object({ username: z.string(), password: z.string() })
      .safeParse(await req.json());

    if (!bodyParsed.success) {
      return badRequestResponse({ details: bodyParsed.error });
    }

    const user = await db.user.findUnique({
      where: { login: bodyParsed.data.username },
    });

    if (!user?.password || !user?.activated) {
      return undefined;
    }

    const isPasswordValid = await bcrypt.compare(
      bodyParsed.data.password,
      user.password
    );

    if (!isPasswordValid) {
      return undefined;
    }

    const token = await jwt.sign({ id: user.id }, process.env.AUTH_SECRET);

    if (!token) {
      return badRequestResponse();
    }

    return NextResponse.json({ id_token: token });
  },
});
