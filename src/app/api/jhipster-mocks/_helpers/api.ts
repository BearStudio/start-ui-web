import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

import { db } from '@/app/api/jhipster-mocks/_helpers/db';
import {
  UserFormatted,
  formatUserFromDb,
} from '@/app/api/jhipster-mocks/_helpers/user';

type Method = {
  public?: boolean;
  admin?: boolean;
  demo?: 'allowed' | 'disallowed';
  handler(params: {
    req: Request;
    params: unknown;
    searchParams: URLSearchParams;
    user?: Partial<UserFormatted>;
  }): Promise<unknown>;
};

type ErrorResponse = (options?: {
  title?: string;
  message?: string;
  details?: unknown;
}) => unknown;

export const demoReadOnlyResponse: ErrorResponse = ({
  title,
  message,
} = {}) => {
  return new NextResponse(
    JSON.stringify({
      title: title ?? 'Demo Mode',
      message: message ?? 'error.demo',
      details:
        'You are currently in demo mode. Some features of the application are disabled or restricted. To remove Read Only mode, you can either change the `NEXT_PUBLIC_IS_DEMO` environment variable to "false" or remove it completely',
    }),
    { status: 403 }
  );
};

export const badRequestResponse: ErrorResponse = ({
  title,
  message,
  details,
} = {}) => {
  return new NextResponse(
    JSON.stringify({
      title: title ?? 'Method argument not valid',
      message: message ?? 'error.validation',
      details,
    }),
    {
      status: 400,
    }
  );
};

export const notSignedInResponse: ErrorResponse = ({
  title,
  message,
  details,
} = {}) => {
  return new NextResponse(
    JSON.stringify({
      title: title ?? 'Not Signed In',
      message: message ?? 'error.http.401',
      details,
    }),
    { status: 401 }
  );
};

export const notAutorizedResponse: ErrorResponse = ({
  title,
  message,
  details,
} = {}) => {
  return new NextResponse(
    JSON.stringify({
      title: title ?? 'Not authorized',
      message: message ?? 'error.http.403',
      details,
    }),
    { status: 403 }
  );
};

export const notFoundResponse: ErrorResponse = ({
  title,
  message,
  details,
} = {}) => {
  return new NextResponse(
    JSON.stringify({
      title: title ?? 'Not Found',
      message: message ?? 'error.http.404',
      details,
    }),
    { status: 404 }
  );
};

export const unknownErrorResponse: ErrorResponse = ({
  title,
  message,
  details,
} = {}) => {
  return new NextResponse(
    JSON.stringify({
      title: title ?? 'Error',
      message: message ?? 'error.http.500',
      details,
    }),
    { status: 500 }
  );
};

export const apiMethod =
  (method: Method) =>
  async (req: Request, { params }: { params: unknown }) => {
    if (
      method.demo === 'disallowed' ||
      (method.demo !== 'allowed' &&
        ['POST', 'DELETE', 'PATCH', 'PUT'].includes(req.method ?? '') &&
        process.env.NEXT_PUBLIC_IS_DEMO === 'true')
    ) {
      return demoReadOnlyResponse();
    }

    const query = req.url.split('?')[1];
    const searchParams = new URLSearchParams(query ?? '');

    if (method.public) {
      return method.handler({ req, params, searchParams });
    }

    const token = req.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return notSignedInResponse();
    }

    try {
      const jwtDecoded = jwt.verify(token, process.env.AUTH_SECRET);

      if (
        !jwtDecoded ||
        typeof jwtDecoded !== 'object' ||
        !('id' in jwtDecoded)
      ) {
        return notSignedInResponse();
      }

      const user = formatUserFromDb(
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
        return notSignedInResponse();
      }

      if (method.admin && !user.authorities?.includes('ROLE_ADMIN')) {
        return notAutorizedResponse();
      }

      return method.handler({
        req,
        params,
        searchParams,
        user,
      });
    } catch (e) {
      return notSignedInResponse();
    }
  };
