import { randomUUID } from 'node:crypto';

export const USER_EMAIL = 'user@user.com';
export const ADMIN_EMAIL = 'admin@admin.com';

export const getRandomEmail = async () => {
  const randomId = await randomUUID();
  return `${randomId}@example.com`;
};
