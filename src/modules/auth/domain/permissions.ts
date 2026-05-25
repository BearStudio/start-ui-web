import { z } from 'zod';

export const rolesNames = ['admin', 'user'] as const;
type UserRole = (typeof rolesNames)[number];

export const permissionStatements = {
  user: [
    'create',
    'list',
    'update',
    'set-role',
    'ban',
    'impersonate',
    'delete',
  ],
  session: ['list', 'revoke', 'delete'],
  account: ['read', 'update'],
  apps: ['app', 'manager'],
  book: ['read', 'create', 'update', 'delete'],
  genre: ['read'],
} as const;

export type Permission = {
  [Resource in keyof typeof permissionStatements]?: Array<
    (typeof permissionStatements)[Resource][number]
  >;
};

export const rolePermissions = {
  user: {
    user: [],
    session: [],
    account: ['update'],
    apps: ['app'],
    book: ['read'],
    genre: ['read'],
  },
  admin: {
    user: [
      'create',
      'list',
      'update',
      'set-role',
      'ban',
      'impersonate',
      'delete',
    ],
    session: ['list', 'revoke', 'delete'],
    account: ['update'],
    apps: ['app', 'manager'],
    book: ['read', 'create', 'update', 'delete'],
    genre: ['read'],
  },
} as const satisfies Record<UserRole, Permission>;

export const zRole: () => z.ZodType<Role> = () => z.enum(rolesNames);
export type Role = keyof typeof rolePermissions;

export const isRole = (value: unknown): value is Role =>
  typeof value === 'string' && value in rolePermissions;

export const parseRole = (value: unknown): Role | undefined =>
  isRole(value) ? value : undefined;

export const hasRolePermission = (role: Role, permissions: Permission) => {
  const grants = rolePermissions[role];
  if (!grants || !permissions || typeof permissions !== 'object') {
    return false;
  }

  return Object.entries(permissions).every(([resource, actions]) => {
    if (!Array.isArray(actions)) return false;
    const allowed = grants[resource as keyof typeof permissionStatements];
    if (!Array.isArray(allowed)) return false;
    return actions.every(
      (action) =>
        typeof action === 'string' &&
        (allowed as readonly string[]).includes(action)
    );
  });
};

export const defaultUserPermissions = {
  account: ['update'],
  apps: ['app'],
  book: ['read'],
  genre: ['read'],
} as const satisfies Permission;
