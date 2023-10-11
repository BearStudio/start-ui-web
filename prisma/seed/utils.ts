import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Those are ANSI espace code to reverse and reset terminal print to emphase logins
// https://en.wikipedia.org/wiki/ANSI_escape_code
const REVERSE = '\x1b[7m';
const RESET = '\x1b[0m';

export function emphasis(str: string) {
  return `${REVERSE}${str}${RESET}`;
}
