import { isMatching, P } from 'ts-pattern';

import { AppError } from '@/modules/kernel/domain/errors/app-error';

export const SERVER_FN_ERROR_CODES = [
  'BAD_REQUEST',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'METHOD_NOT_SUPPORTED',
  'INTERNAL_SERVER_ERROR',
] as const;

export type ServerFnErrorCode = (typeof SERVER_FN_ERROR_CODES)[number];

export type ServerFnErrorData = {
  target?: string[] | string;
  [key: string]: unknown;
};

const STATUS_BY_CODE: Record<ServerFnErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  METHOD_NOT_SUPPORTED: 405,
  INTERNAL_SERVER_ERROR: 500,
};

const CATEGORY_BY_CODE: Record<
  ServerFnErrorCode,
  ConstructorParameters<typeof AppError>[0]['category']
> = {
  BAD_REQUEST: 'bad_request',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  CONFLICT: 'conflict',
  METHOD_NOT_SUPPORTED: 'bad_request',
  INTERNAL_SERVER_ERROR: 'system',
};

export class ServerFnError extends AppError {
  static readonly NAME = 'ServerFnError';

  readonly data?: ServerFnErrorData;

  constructor(
    code: ServerFnErrorCode,
    options?: { message?: string; data?: ServerFnErrorData }
  ) {
    super({
      code,
      category: CATEGORY_BY_CODE[code],
      status: STATUS_BY_CODE[code],
      message: options?.message ?? code,
      details: options?.data,
    });
    this.name = ServerFnError.NAME;
    this.data = options?.data;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      status: this.status,
      message: this.message,
      data: this.data,
    };
  }
}

export function isServerFnError(error: unknown): error is ServerFnError {
  if (error instanceof ServerFnError) return true;
  return isMatching(
    {
      code: P.string,
      name: ServerFnError.NAME,
    },
    error
  );
}
