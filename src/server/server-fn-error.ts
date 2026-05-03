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

export class ServerFnError extends Error {
  static readonly NAME = 'ServerFnError';

  readonly code: ServerFnErrorCode;
  readonly status: number;
  readonly data?: ServerFnErrorData;

  constructor(
    code: ServerFnErrorCode,
    options?: { message?: string; data?: ServerFnErrorData }
  ) {
    super(options?.message ?? code);
    this.name = ServerFnError.NAME;
    this.code = code;
    this.status = STATUS_BY_CODE[code];
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
  if (
    error &&
    typeof error === 'object' &&
    'name' in error &&
    error.name === ServerFnError.NAME &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  ) {
    return true;
  }
  return false;
}
