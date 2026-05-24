import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc } from 'better-auth/plugins/admin/access';

import {
  permissionStatements,
  rolePermissions,
} from '../../domain/permissions';

const ac = createAccessControl(permissionStatements);

const user = ac.newRole(rolePermissions.user);
const admin = ac.newRole({
  ...adminAc.statements,
  ...rolePermissions.admin,
});

export const betterAuthPermissions = {
  ac,
  roles: {
    admin,
    user,
  },
};
