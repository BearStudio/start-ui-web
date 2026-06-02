import { Result } from '@swan-io/boxed';
import { match, P } from 'ts-pattern';

import type {
  ApplicationResult,
  DomainOutcome,
} from '@/modules/kernel/application/result';
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
          ? error.details
          : undefined,
    });
  }
  throw error;
};

type OutcomeHandler<TOutcome extends DomainOutcome, TResult> =
  | ReasonConfig
  | ((outcome: TOutcome) => TResult);

export type OutcomeHandlerConfig<TOutcome extends DomainOutcome, TResult> = {
  [TType in TOutcome['type']]: OutcomeHandler<
    Extract<TOutcome, { type: TType }>,
    TResult
  >;
};

type OutcomeHandlerReturn<THandlers> = {
  [TKey in keyof THandlers]: THandlers[TKey] extends (
    outcome: ExplicitAny
  ) => infer TResult
    ? TResult
    : never;
}[keyof THandlers];

export async function unwrapApplicationResult<
  TOutcome extends DomainOutcome,
  THandlers extends OutcomeHandlerConfig<TOutcome, unknown>,
>(
  result: Promise<ApplicationResult<TOutcome>> | ApplicationResult<TOutcome>,
  handlers: THandlers
): Promise<OutcomeHandlerReturn<THandlers>> {
  const value = await Promise.resolve(result).catch(mapAppErrorToServerFnError);

  return match(value)
    .with(Result.P.Ok(P.select()), (outcome) => {
      const typedOutcome = outcome as unknown as TOutcome;
      const outcomeType = typedOutcome.type as TOutcome['type'];
      const handler = handlers[outcomeType];
      if (typeof handler === 'function') {
        return (
          handler as (outcome: TOutcome) => OutcomeHandlerReturn<THandlers>
        )(typedOutcome);
      }
      return throwServerFnErrorForReason(outcomeType, {
        [outcomeType]: handler,
      });
    })
    .with(Result.P.Error(P.select()), (error) =>
      mapAppErrorToServerFnError(error)
    )
    .exhaustive();
}
