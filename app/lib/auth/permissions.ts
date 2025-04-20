import { UserRole } from '@prisma/client';
import {
  createAccessControl,
  Role as BetterAuthRole,
} from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

const statement = {
  ...defaultStatements,
  account: ['read', 'update'],
  apps: ['app', 'manager'],
  repository: ['read', 'create', 'update', 'delete'],
} as const;

const ac = createAccessControl(statement);

const user = ac.newRole({
  account: ['update'],
  apps: ['app'],
  repository: ['read'],
});

const admin = ac.newRole({
  ...adminAc.statements,
  account: ['update'],
  apps: ['app', 'manager'],
  repository: ['read', 'create', 'update', 'delete'],
});

export type Role = keyof typeof roles;
const roles = {
  admin,
  user,
} satisfies Record<UserRole, BetterAuthRole>;

export const permissions = {
  ac,
  roles,
};
