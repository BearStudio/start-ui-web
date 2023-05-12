import jwt from 'jsonwebtoken';

import { getAccount } from '@/app/api/jhipster-mocks/account/service';
import { UserFormatted } from '@/app/api/jhipster-mocks/admin/users/service';

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

type ErrorResponse = (options?: { title?: string }) => unknown;

export const demoReadOnlyResponse: ErrorResponse = ({ title } = {}) => {
  return new Response(title ?? 'Demo Mode', { status: 403 });
};

export const badRequestResponse: ErrorResponse = ({ title } = {}) => {
  return new Response(title ?? 'Method argument not valid', { status: 400 });
};

export const notSignedInResponse: ErrorResponse = ({ title } = {}) => {
  return new Response(title ?? 'Not Signed In', { status: 401 });
};

export const notAutorizedResponse: ErrorResponse = ({ title } = {}) => {
  return new Response(title ?? 'Not Authorized', { status: 403 });
};

export const notFoundResponse: ErrorResponse = ({ title } = {}) => {
  return new Response(title ?? 'Not Found', { status: 404 });
};

export const unknownErrorResponse: ErrorResponse = ({ title } = {}) => {
  return new Response(title ?? 'Error', { status: 500 });
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

      const user = await getAccount(jwtDecoded.id);

      if (!user) {
        return notSignedInResponse();
      }

      if (method.admin && !user.authorities?.includes('ROLE_ADMIN')) {
        return notAutorizedResponse();
      }

      return method.handler({ req, params, searchParams, user });
    } catch (e) {
      return notSignedInResponse();
    }
  };
