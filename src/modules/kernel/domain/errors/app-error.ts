export type AppErrorCategory =
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'rate_limit'
  | 'system';

export type AppErrorDetails = Record<string, unknown>;

export type AppErrorOptions = {
  code: string;
  category: AppErrorCategory;
  status: number;
  message?: string;
  details?: AppErrorDetails;
  cause?: unknown;
};

export class AppError extends Error {
  readonly code: string;
  readonly category: AppErrorCategory;
  readonly status: number;
  readonly details?: AppErrorDetails;

  constructor(options: AppErrorOptions) {
    super(options.message ?? options.code, { cause: options.cause });
    this.name = 'AppError';
    this.code = options.code;
    this.category = options.category;
    this.status = options.status;
    this.details = options.details;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
