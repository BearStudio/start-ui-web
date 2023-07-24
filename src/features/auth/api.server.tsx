import { createNextRoute } from '@ts-rest/next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { contract } from '@/api/contract';
import { db } from '@/api/db';
import { apiGuard, errorResponseBadRequest } from '@/api/helpers';

export const authRouter = createNextRoute(contract.auth, {
  authenticate: async ({ req, body }) => {
    const { success, errorResponse } = await apiGuard(req, {
      public: true,
      demo: 'allowed',
    });
    if (!success) return errorResponse;

    const user = await db.user.findUnique({
      where: { login: body.username },
    });
    if (!user?.password || !user?.activated) return errorResponseBadRequest;

    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) return errorResponseBadRequest;

    const token = await jwt.sign({ id: user.id }, process.env.AUTH_SECRET);
    if (!token) return errorResponseBadRequest;

    return {
      status: 200,
      body: { id_token: token },
    };
  },
});
