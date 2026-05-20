import { z } from 'zod';

const zCuidCompatibleId = () => z.string().trim().min(1);

export const zUserId = () => zCuidCompatibleId().brand<'UserId'>();
export type UserId = z.infer<ReturnType<typeof zUserId>>;

export const zBookId = () => zCuidCompatibleId().brand<'BookId'>();
export type BookId = z.infer<ReturnType<typeof zBookId>>;

export const zGenreId = () => zCuidCompatibleId().brand<'GenreId'>();
export type GenreId = z.infer<ReturnType<typeof zGenreId>>;

export const zSessionId = () => zCuidCompatibleId().brand<'SessionId'>();
export type SessionId = z.infer<ReturnType<typeof zSessionId>>;

export const zEmailAddress = () => z.email().brand<'EmailAddress'>();
export type EmailAddress = z.infer<ReturnType<typeof zEmailAddress>>;

export const toUserId = (value: string) => zUserId().parse(value);
export const toBookId = (value: string) => zBookId().parse(value);
export const toGenreId = (value: string) => zGenreId().parse(value);
export const toSessionId = (value: string) => zSessionId().parse(value);
export const toEmailAddress = (value: string) => zEmailAddress().parse(value);
