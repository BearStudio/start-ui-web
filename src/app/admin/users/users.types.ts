export type UserRole = 'ROLE_ADMIN' | 'ROLE_USER';

export interface User {
  id: number;
  login: string;
  firstName?: string;
  lastName?: string;
  email: string;
  activated: boolean;
  langKey: string;
  authorities: UserRole[];
  createdBy?: string;
  createdDate?: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
}

export interface UserList {
  content: User[];
  totalItems: number;
}
