import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

import { db } from './db';

type HttpVerbs = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';
type Methods = {
  [key in HttpVerbs]?: {
    public?: boolean;
    handler(params: {
      req: NextApiRequest;
      res: NextApiResponse;
      user?: Partial<User>;
    }): Promise<unknown>;
  };
};

export const badRequest = (res: NextApiResponse) => {
  return res.status(400).end();
};

export const notSignedIn = (res: NextApiResponse) => {
  return res.status(401).end();
};

export const notFound = (res: NextApiResponse) => {
  return res.status(404).end();
};

export const apiMethods =
  (methods: Methods = {}) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method && methods[req.method as keyof typeof methods];

    if (!method) {
      return res.status(405).end();
    }

    if (method.public) {
      return method.handler({ req, res });
    }

    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return notSignedIn(res);
    }

    const jwtDecoded = jwt.verify(token, process.env.AUTH_SECRET);

    if (
      !jwtDecoded ||
      typeof jwtDecoded !== 'object' ||
      !('id' in jwtDecoded)
    ) {
      return notSignedIn(res);
    }

    const user = await db.user.findUnique({
      where: { id: jwtDecoded.id },
      select: {
        id: true,
        login: true,
        email: true,
        firstName: true,
        lastName: true,
        authorities: true,
        langKey: true,
      },
    });

    if (!user) {
      return notSignedIn(res);
    }

    return method.handler({ req, res, user });
  };
