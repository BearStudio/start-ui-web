import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

import { getAccount } from '@/mock-server/account';
import { UserFormatted } from '@/mock-server/users';

type HttpVerbs = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';
type Methods = {
  [key in HttpVerbs]?: {
    public?: boolean;
    admin?: boolean;
    demo?: 'allowed' | 'disallowed';
    handler(params: {
      req: NextApiRequest;
      res: NextApiResponse;
      user?: Partial<UserFormatted>;
    }): Promise<unknown>;
  };
};

type ErrorResponse = (
  res: NextApiResponse,
  options?: { title?: string; message?: string; details?: string }
) => unknown;

export const demoReadOnlyResponse: ErrorResponse = (
  res,
  { title, message } = {}
) => {
  return res.status(403).json({
    title: title ?? 'Demo Mode',
    message: message ?? 'error.demo',
    details:
      'You are currently in demo mode. Certain features of the application are disabled or restricted. To remove Read Only mode, you can either change the `NEXT_PUBLIC_IS_DEMO` environment variable to "false" or remove it completely',
  });
};

export const badRequestResponse: ErrorResponse = (
  res,
  { title, message, details } = {}
) => {
  return res.status(400).json({
    title: title ?? 'Method argument not valid',
    message: message ?? 'error.validation',
    details,
  });
};

export const notSignedInResponse: ErrorResponse = (
  res,
  { title, message, details } = {}
) => {
  return res.status(401).json({
    title: title ?? 'Not Signed In',
    message: message ?? 'error.http.401',
    details,
  });
};

export const notAutorizedResponse: ErrorResponse = (
  res,
  { title, message, details } = {}
) => {
  return res.status(403).json({
    title: title ?? 'Not Authorized',
    message: message ?? 'error.http.403',
    details,
  });
};

export const notFoundResponse: ErrorResponse = (
  res,
  { title, message, details } = {}
) => {
  return res.status(404).json({
    title: title ?? 'Not Found',
    message: message ?? 'error.http.404',
    details,
  });
};

export const apiMethods =
  (methods: Methods = {}) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method && methods[req.method as keyof typeof methods];

    if (!method) {
      return res.status(405).end();
    }

    if (
      method.demo === 'disallowed' ||
      (method.demo !== 'allowed' &&
        ['POST', 'DELETE', 'PATCH', 'PUT'].includes(req.method ?? '') &&
        process.env.NEXT_PUBLIC_IS_DEMO === 'true')
    ) {
      return demoReadOnlyResponse(res);
    }

    if (method.public) {
      return method.handler({ req, res });
    }

    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return notSignedInResponse(res);
    }

    try {
      const jwtDecoded = jwt.verify(token, process.env.AUTH_SECRET);

      if (
        !jwtDecoded ||
        typeof jwtDecoded !== 'object' ||
        !('id' in jwtDecoded)
      ) {
        return notSignedInResponse(res);
      }

      const user = await getAccount(jwtDecoded.id);

      if (!user) {
        return notSignedInResponse(res);
      }

      if (method.admin && !user.authorities?.includes('ROLE_ADMIN')) {
        return notAutorizedResponse(res);
      }

      return method.handler({ req, res, user });
    } catch (e) {
      return notSignedInResponse(res);
    }
  };
