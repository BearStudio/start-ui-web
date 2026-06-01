import { z } from 'zod';

import { IdValidationError } from './errors/id-validation-error';

type InternalBrand<TValue, TBrand extends string> = TValue & {
  readonly __brand: TBrand;
};

const zBrandedNonEmptyString = <TBrand extends string>() =>
  z.string().trim().min(1).brand<TBrand>();

export const zUserIdSchema = zBrandedNonEmptyString<'UserId'>();
export const zBookIdSchema = zBrandedNonEmptyString<'BookId'>();
export const zGenreIdSchema = zBrandedNonEmptyString<'GenreId'>();
export const zSessionIdSchema = zBrandedNonEmptyString<'SessionId'>();
export const zScopeKeySchema = zBrandedNonEmptyString<'ScopeKey'>();
export const zAuthorIdSchema = zBrandedNonEmptyString<'AuthorId'>();
export const zPublisherIdSchema = zBrandedNonEmptyString<'PublisherId'>();
export const zBookCoverObjectKeySchema =
  zBrandedNonEmptyString<'BookCoverObjectKey'>();
export const zEmailStatusIdSchema = zBrandedNonEmptyString<'EmailStatusId'>();
export const zEmailProviderMessageIdSchema =
  zBrandedNonEmptyString<'EmailProviderMessageId'>();
export const zEmailIdempotencyKeySchema =
  zBrandedNonEmptyString<'EmailIdempotencyKey'>();
export const zEmailWebhookEventIdSchema =
  zBrandedNonEmptyString<'EmailWebhookEventId'>();
export const zEmailRecipientListSchema =
  zBrandedNonEmptyString<'EmailRecipientList'>();
export const zOtpCodeSchema = z.string().trim().length(6).brand<'OtpCode'>();
export const zLanguageCodeSchema = zBrandedNonEmptyString<'LanguageCode'>();
export const zEmailAddressSchema = z
  .string()
  .trim()
  .pipe(z.email())
  .brand<'EmailAddress'>();

export type UserId = z.infer<typeof zUserIdSchema>;
export type BookId = z.infer<typeof zBookIdSchema>;
export type GenreId = z.infer<typeof zGenreIdSchema>;
export type SessionId = z.infer<typeof zSessionIdSchema>;
export type AuthSessionId = SessionId;
export type ScopeKey = z.infer<typeof zScopeKeySchema>;
export type AuthorId = z.infer<typeof zAuthorIdSchema>;
export type PublisherId = z.infer<typeof zPublisherIdSchema>;
export type BookCoverObjectKey = z.infer<typeof zBookCoverObjectKeySchema>;
export type EmailStatusId = z.infer<typeof zEmailStatusIdSchema>;
export type EmailProviderMessageId = z.infer<
  typeof zEmailProviderMessageIdSchema
>;
export type EmailIdempotencyKey = z.infer<typeof zEmailIdempotencyKeySchema>;
export type EmailWebhookEventId = z.infer<typeof zEmailWebhookEventIdSchema>;
export type EmailRecipientList = z.infer<typeof zEmailRecipientListSchema>;
export type OtpCode = z.infer<typeof zOtpCodeSchema>;
export type LanguageCode = z.infer<typeof zLanguageCodeSchema>;
export type EmailAddress = z.infer<typeof zEmailAddressSchema>;

export type GeneratedId = InternalBrand<string, 'GeneratedId'>;
export type RequestId = InternalBrand<string, 'RequestId'>;
export type CorrelationId = InternalBrand<string, 'CorrelationId'>;
export type CacheKey = InternalBrand<string, 'CacheKey'>;

const ensureNonEmptyId = (value: string, typeName: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new IdValidationError(typeName, value);
  }
  return trimmed;
};

const parseBrandedString = <TSchema extends z.ZodType>(
  schema: TSchema,
  value: string,
  typeName: string,
  message?: string
): z.output<TSchema> => {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new IdValidationError(typeName, value, message);
  }
  return result.data;
};

export const toUserId = (value: string): UserId =>
  parseBrandedString(zUserIdSchema, value, 'UserId');
export const toBookId = (value: string): BookId =>
  parseBrandedString(zBookIdSchema, value, 'BookId');
export const toGenreId = (value: string): GenreId =>
  parseBrandedString(zGenreIdSchema, value, 'GenreId');
export const toSessionId = (value: string): SessionId =>
  parseBrandedString(zSessionIdSchema, value, 'SessionId');
export const toScopeKey = (value: string): ScopeKey =>
  parseBrandedString(zScopeKeySchema, value, 'ScopeKey');
export const toAuthorId = (value: string): AuthorId =>
  parseBrandedString(zAuthorIdSchema, value, 'AuthorId');
export const toPublisherId = (value: string): PublisherId =>
  parseBrandedString(zPublisherIdSchema, value, 'PublisherId');
export const toBookCoverObjectKey = (value: string): BookCoverObjectKey =>
  parseBrandedString(zBookCoverObjectKeySchema, value, 'BookCoverObjectKey');
export const toEmailStatusId = (value: string): EmailStatusId =>
  parseBrandedString(zEmailStatusIdSchema, value, 'EmailStatusId');
export const toEmailProviderMessageId = (
  value: string
): EmailProviderMessageId =>
  parseBrandedString(
    zEmailProviderMessageIdSchema,
    value,
    'EmailProviderMessageId'
  );
export const toEmailIdempotencyKey = (value: string): EmailIdempotencyKey =>
  parseBrandedString(zEmailIdempotencyKeySchema, value, 'EmailIdempotencyKey');
export const toEmailWebhookEventId = (value: string): EmailWebhookEventId =>
  parseBrandedString(zEmailWebhookEventIdSchema, value, 'EmailWebhookEventId');
export const toEmailRecipientList = (value: string): EmailRecipientList =>
  parseBrandedString(zEmailRecipientListSchema, value, 'EmailRecipientList');
export const toOtpCode = (value: string): OtpCode =>
  parseBrandedString(zOtpCodeSchema, value, 'OtpCode', 'OtpCode is invalid');
export const toLanguageCode = (value: string): LanguageCode =>
  parseBrandedString(zLanguageCodeSchema, value, 'LanguageCode');
export const toEmailAddress = (value: string): EmailAddress =>
  parseBrandedString(
    zEmailAddressSchema,
    value,
    'EmailAddress',
    'EmailAddress is invalid'
  );

export const toGeneratedId = (value: string): GeneratedId =>
  ensureNonEmptyId(value, 'GeneratedId') as GeneratedId;
export const toRequestId = (value: string): RequestId =>
  ensureNonEmptyId(value, 'RequestId') as RequestId;
export const toCorrelationId = (value: string): CorrelationId =>
  ensureNonEmptyId(value, 'CorrelationId') as CorrelationId;
export const toCacheKey = (value: string): CacheKey =>
  ensureNonEmptyId(value, 'CacheKey') as CacheKey;

export const zUserId = () => zUserIdSchema;
export const zBookId = () => zBookIdSchema;
export const zGenreId = () => zGenreIdSchema;
export const zSessionId = () => zSessionIdSchema;
export const zScopeKey = () => zScopeKeySchema;
export const zAuthorId = () => zAuthorIdSchema;
export const zPublisherId = () => zPublisherIdSchema;
export const zBookCoverObjectKey = () => zBookCoverObjectKeySchema;
export const zEmailStatusId = () => zEmailStatusIdSchema;
export const zEmailProviderMessageId = () => zEmailProviderMessageIdSchema;
export const zEmailIdempotencyKey = () => zEmailIdempotencyKeySchema;
export const zEmailWebhookEventId = () => zEmailWebhookEventIdSchema;
export const zEmailRecipientList = () => zEmailRecipientListSchema;
export const zOtpCode = () => zOtpCodeSchema;
export const zLanguageCode = () => zLanguageCodeSchema;
export const zEmailAddress = () => zEmailAddressSchema;
