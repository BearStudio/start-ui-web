import { internet, name } from 'faker';
import { Factory } from 'miragejs';

type Authority = 'ROLE_ADMIN' | 'ROLE_USER';

export const UserFactory = Factory.extend({
  login: (): string => internet.userName(),
  email: (): string => internet.email(),
  firstName: (): string => name.firstName(),
  lastName: (): string => name.lastName(),
  langKey: (): string => 'en',
  activated: (): boolean => true,
  authorities: (): Authority[] => ['ROLE_USER', 'ROLE_ADMIN'],
});
