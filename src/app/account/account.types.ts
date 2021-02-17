export type AccountRole = 'ROLE_ADMIN' | 'ROLE_USER';

export interface Account {
  id: number;
  login: string;
  firstName?: string;
  lastName?: string;
  email: string;
  activated: boolean;
  langKey: string;
  authorities: AccountRole[];
  createdBy?: string;
  createdDate?: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
}
