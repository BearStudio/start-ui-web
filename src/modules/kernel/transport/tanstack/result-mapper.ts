import { AppError } from '@/modules/kernel/domain/errors/app-error';

import { ServerFnError, type ServerFnErrorCode } from './server-fn-error';

type ReasonConfig =
  | ServerFnErrorCode
  | {
      code: ServerFnErrorCode;
      message?: string;
      data?: Record<string, unknown>;
    };

const codeForCategory: Record<AppError['category'], ServerFnErrorCode> = {
  bad_request: 'BAD_REQUEST',
  conflict: 'CONFLICT',
  forbidden: 'FORBIDDEN',
  not_found: 'NOT_FOUND',
  rate_limit: 'BAD_REQUEST',
  system: 'INTERNAL_SERVER_ERROR',
  unauthorized: 'UNAUTHORIZED',
};

export const throwServerFnErrorForReason = (
  reason: string,
  reasons: Record<string, ReasonConfig>
): never => {
  const config = reasons[reason];
  if (!config) {
    throw new ServerFnError('INTERNAL_SERVER_ERROR');
  }
  if (typeof config === 'string') {
    throw new ServerFnError(config);
  }
  throw new ServerFnError(config.code, {
    message: config.message,
    data: config.data,
  });
};

export const mapAppErrorToServerFnError = (error: unknown): never => {
  if (error instanceof AppError) {
    throw new ServerFnError(codeForCategory[error.category], {
      message: error.message,
      data:
        error.exposeDetails && typeof error.details === 'object'
          ? (error.details as Record<string, unknown>)
          : undefined,
    });
  }
  throw error;
};
