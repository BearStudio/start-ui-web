import { and, count, eq } from 'drizzle-orm';

import { db } from '@/server/db';
import { books, genres, users } from '@/server/db/schema';

export async function countUsers() {
  const [result] = await db.select({ value: count() }).from(users);
  return result?.value ?? 0;
}

export async function countBooks() {
  const [result] = await db.select({ value: count() }).from(books);
  return result?.value ?? 0;
}

export async function countGenres() {
  const [result] = await db.select({ value: count() }).from(genres);
  return result?.value ?? 0;
}

export async function findUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user;
}

export async function findGenreByName(name: string) {
  const [genre] = await db
    .select()
    .from(genres)
    .where(eq(genres.name, name))
    .limit(1);
  return genre;
}

export async function listGenres() {
  return await db.select().from(genres).orderBy(genres.name);
}

export async function findBookByTitleAndAuthor(title: string, author: string) {
  const [book] = await db
    .select()
    .from(books)
    .where(and(eq(books.title, title), eq(books.author, author)))
    .limit(1);

  return book ?? null;
}
