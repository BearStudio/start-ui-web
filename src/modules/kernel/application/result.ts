export type UseCaseResult<T, TReason extends string> =
  | { ok: true; value: T }
  | { ok: false; reason: TReason };

export const ok = <T>(value: T): UseCaseResult<T, never> => ({
  ok: true,
  value,
});

export const fail = <TReason extends string>(
  reason: TReason
): UseCaseResult<never, TReason> => ({
  ok: false,
  reason,
});
