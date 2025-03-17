import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

const statement = {
  ...defaultStatements,
  repository: ['create', 'update', 'delete'],
} as const;

export const ac = createAccessControl(statement);

const user = ac.newRole({
  repository: ['create', 'update', 'delete'],
});

const admin = ac.newRole({
  ...adminAc.statements,
  repository: ['create', 'update', 'delete'],
});

export const roles = {
  admin,
  user,
};
