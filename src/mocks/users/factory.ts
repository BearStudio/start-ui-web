import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import { Factory } from 'miragejs';

type Authority = 'ROLE_ADMIN' | 'ROLE_USER';

export const UserFactory = Factory.extend({
  login: (): string => faker.internet.userName(),
  email: (): string => faker.internet.email(),
  firstName: (): string => faker.name.firstName(),
  lastName: (): string => faker.name.lastName(),
  createdBy: (): string => faker.name.firstName(),
  createdDate: () => dayjs(faker.date.past()).format(),
  lastModifiedBy: (): string => faker.name.firstName(),
  lastModifiedDate: () => dayjs(faker.date.past()).format(),
  langKey: (): string => 'en',
  activated: (): boolean => true,
  authorities: (): Authority[] => ['ROLE_USER', 'ROLE_ADMIN'],
});
