import jwt from 'jsonwebtoken';
import { NextApiRequest } from 'next';

import { db } from '@/api/db';
import { userFormatFromDb } from '@/features/users/helpers.server';

export const errorResponseDemoReadOnly = {
  status: 403,
  body: {
    title: 'Demo Mode',
    errorKey: 'error.demo',
    details:
      'You are currently in demo mode. Some features of the application are disabled or restricted. To remove Read Only mode, you can either change the `NEXT_PUBLIC_IS_DEMO` environment variable to "false" or remove it completely',
  },
} as const;

export const errorResponseBadRequest = {
  status: 400,
  body: {
    title: 'Method argument not valid',
    errorKey: 'error.validation',
  },
} as const;

export const errorResponseNotSignedIn = {
  status: 401,
  body: {
    title: 'Not Signed In',
    errorKey: 'error.http.401',
  },
} as const;

export const errorResponseNotAutorized = {
  status: 403,
  body: {
    title: 'Not authorized',
    errorKey: 'error.http.403',
  },
} as const;

export const errorResponseNotFound = {
  status: 404,
  body: {
    title: 'Not Found',
    errorKey: 'error.http.404',
  },
} as const;

export const errorResponseUnknown = {
  status: 500,
  body: {
    title: 'Error',
    errorKey: 'error.http.500',
  },
} as const;

export const apiGuard = async (
  req: NextApiRequest,
  options?: {
    public?: boolean;
    admin?: boolean;
    demo?: 'allowed' | 'disallowed';
  }
) => {
  if (
    options?.demo === 'disallowed' ||
    (options?.demo !== 'allowed' &&
      ['POST', 'DELETE', 'PATCH', 'PUT'].includes(req.method ?? '') &&
      process.env.NEXT_PUBLIC_IS_DEMO === 'true')
  ) {
    return {
      success: false,
      errorResponse: errorResponseDemoReadOnly,
    } as const;
  }

  if (options?.public) {
    return { success: true, user: null } as const;
  }

  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return { success: false, errorResponse: errorResponseNotSignedIn } as const;
  }

  try {
    const jwtDecoded = jwt.verify(token, process.env.AUTH_SECRET);

    if (
      !jwtDecoded ||
      typeof jwtDecoded !== 'object' ||
      !('id' in jwtDecoded)
    ) {
      return {
        success: false,
        errorResponse: errorResponseNotSignedIn,
      } as const;
    }

    const user = userFormatFromDb(
      await db.user.findUnique({
        where: { id: jwtDecoded.id, activated: true },
        select: {
          id: true,
          login: true,
          email: true,
          firstName: true,
          lastName: true,
          authorities: true,
          langKey: true,
          activated: true,
        },
      })
    );

    if (!user) {
      return {
        success: false,
        errorResponse: errorResponseNotSignedIn,
      } as const;
    }

    if (options?.admin && !user.authorities?.includes('ROLE_ADMIN')) {
      return {
        success: false,
        errorResponse: errorResponseNotAutorized,
      } as const;
    }

    return { success: true, user } as const;
  } catch (e) {
    return { success: false, errorResponse: errorResponseNotSignedIn } as const;
  }
};
