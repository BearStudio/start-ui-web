import { createServer, Model, Serializer } from 'miragejs';

import { AccountRoutes } from './account';
import { AuthRoutes } from './auth';
import { UsersRoutes } from './users';
import { UserFactory } from './users/factory';

const AppSerializer = Serializer.extend({
  embed: true,
  root: false,
});

export const mockServer = () => {
  return createServer({
    serializers: {
      application: AppSerializer,
    },

    models: {
      user: Model.extend({}),
    },

    factories: {
      user: UserFactory,
    },

    seeds(server) {
      server.create('user', {
        login: 'admin',
        authorities: ['ROLE_ADMIN', 'ROLE_USER'],
      });
      server.create('user', { login: 'user', authorities: ['ROLE_USER'] });
      server.createList('user', 10);
    },

    routes() {
      this.namespace = '/api';

      AuthRoutes(this);
      UsersRoutes(this);
      AccountRoutes(this);

      this.namespace = '/';
      this.passthrough();
    },
  });
};
