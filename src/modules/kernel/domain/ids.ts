import { z } from 'zod';

import { IdValidationError } from './errors/id-validation-error';

type Brand<TValue, TBrand extends string> = TValue & {
  readonly __brand: TBrand;
};

export type UserId = Brand<string, 'UserId'>;
export type BookId = Brand<string, 'BookId'>;
export type GenreId = Brand<string, 'GenreId'>;
export type SessionId = Brand<string, 'SessionId'>;
export type AuthSessionId = SessionId;
export type ScopeKey = Brand<string, 'ScopeKey'>;
export type EmailAddress = Brand<string, 'EmailAddress'>;

const ensureNonEmptyId = (value: string, typeName: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new IdValidationError(typeName, value);
  }
  return trimmed;
};

export const toUserId = (value: string): UserId =>
  ensureNonEmptyId(value, 'UserId') as UserId;
export const toBookId = (value: string): BookId =>
  ensureNonEmptyId(value, 'BookId') as BookId;
export const toGenreId = (value: string): GenreId =>
  ensureNonEmptyId(value, 'GenreId') as GenreId;
export const toSessionId = (value: string): SessionId =>
  ensureNonEmptyId(value, 'SessionId') as SessionId;
export const toScopeKey = (value: string): ScopeKey =>
  ensureNonEmptyId(value, 'ScopeKey') as ScopeKey;

export const toEmailAddress = (value: string): EmailAddress => {
  const trimmed = value.trim();
  const result = z.email().safeParse(trimmed);
  if (!result.success) {
    throw new IdValidationError(
      'EmailAddress',
      value,
      'EmailAddress is invalid'
    );
  }
  return result.data as EmailAddress;
};

export const zUserId = () => z.string().transform(toUserId);
export const zBookId = () => z.string().transform(toBookId);
export const zGenreId = () => z.string().transform(toGenreId);
export const zSessionId = () => z.string().transform(toSessionId);
export const zScopeKey = () => z.string().transform(toScopeKey);
export const zEmailAddress = () => z.string().transform(toEmailAddress);
