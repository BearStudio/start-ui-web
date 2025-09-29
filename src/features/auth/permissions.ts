import {
  createAccessControl,
  Role as BetterAuthRole,
} from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';
import { z } from 'zod';

import { authClient } from '@/features/auth/client';
import { UserRole } from '@/server/db/generated/client';

const statement = {
  ...defaultStatements,
  account: ['read', 'update'],
  apps: ['app', 'manager'],
  book: ['read', 'create', 'update', 'delete'],
  genre: ['read'],
} as const;

const ac = createAccessControl(statement);

const user = ac.newRole({
  account: ['update'],
  apps: ['app'],
  book: ['read'],
  genre: ['read'],
});

const admin = ac.newRole({
  ...adminAc.statements,
  account: ['update'],
  apps: ['app', 'manager'],
  book: ['read', 'create', 'update', 'delete'],
  genre: ['read'],
});

export const rolesNames = ['admin', 'user'] as const;
export const zRole: () => z.ZodType<Role> = () => z.enum(rolesNames);
export type Role = keyof typeof roles;
const roles = {
  admin,
  user,
} satisfies Record<UserRole, BetterAuthRole>;

export const permissions = {
  ac,
  roles,
};

export type Permission = NonNullable<
  Parameters<typeof authClient.admin.hasPermission>['0']['permission']
>;
