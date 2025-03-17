import { UserRole } from '@prisma/client';
import { createAccessControl, Role } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

const statement = {
  ...defaultStatements,
  apps: ['app', 'admin'],
  repository: ['read', 'create', 'update', 'delete'],
} as const;

const ac = createAccessControl(statement);

const user = ac.newRole({
  apps: ['app'],
  repository: ['read', 'create', 'update', 'delete'],
});

const admin = ac.newRole({
  ...adminAc.statements,
  apps: ['app', 'admin'],
  repository: ['read', 'create', 'update', 'delete'],
});

export type ROLE = keyof typeof roles;
const roles = {
  admin,
  user,
} satisfies Record<UserRole, Role>;

export const permissions = {
  ac,
  roles,
};
