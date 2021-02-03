import { createServer, Factory, Model, Serializer, Response } from 'miragejs';

import { UsersRoutes } from './users';

type Authority = 'ROLE_ADMIN' | 'ROLE_USER';

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
      user: Factory.extend({
        login: () => 'admin',
        email: () => 'admin@example.com',
        firstName: (): string => "I'm an",
        lastName: () => Math.random(),
        langKey: () => 'en',
        activated: () => true,
        authorities: (): Authority[] => ['ROLE_USER', 'ROLE_ADMIN'],
      }),
    },

    seeds(server) {
      server.create('user', { firstName: 'Toto', authorities: ['ROLE_ADMIN'] });
      server.createList('user', 3);
    },

    routes() {
      this.namespace = '/api';

      this.get('/account', (schema) => {
        return schema.first('user');
      });

      // UsersRoutes(this);

      this.namespace = '/';
      this.passthrough();
    },
  });
};

/*
export const mockServer = () => {
  createServer({
    serializers: {
      application: AppSerializer,
    },

    models: {
      account: Model.extend({}),
      user: Model.extend({}),
    },

    factories: {
      account: Factory.extend({
        login: (n): string => `Pet ${n}`,
      }),
      user: Factory.extend({
        login: (n): string => `Pet ${n}`,
      }),
    },
    seeds(server) {
      server.create("account", {
        id: '1',
        login: 'admin',
        email: 'admin@example.com',
        firstName: 'I\'m an',
        lastName: 'admin exemple',
        langKey: 'en',
        activated: true,
        authorities: ['ROLE_USER', 'ROLE_ADMIN'],
      })

      server.create("user", {
        id: '1',
        login: 'admin',
        email: 'admin@example.com',
        firstName: 'I\'m an',
        lastName: 'admin exemple',
        langKey: 'en',
        activated: true,
        authorities: ['ROLE_USER', 'ROLE_ADMIN'],
      })
      server.create("user", {
        id: '2',
        login: 'user',
        email: 'user@example.com',
        firstName: 'I\'m an',
        lastName: 'exemple',
        langKey: 'en',
        activated: true,
        authorities: ['ROLE_USER'],
      })
    },
    routes() {
      this.get("/api/account", (schema) => {
        console.log(schema.findBy("account", { login: "admin" }));
        return schema.find("account", "1");
      });

      this.post("http://localhost:8080/api/account", (schema: any, request) => {
        const oldAccount = schema.accounts.all();
        oldAccount.models[0].attrs = JSON.parse(request.requestBody);
        oldAccount.save();
        return oldAccount;
      });

      this.get("http://localhost:8080/api/users", (schema) => {
        const users = schema.all("users");
        console.log(users);
        return new Response(200, { "x-total-count": users.length.toString() }, users);
      });

      this.get("http://localhost:8080/api/users/:userLogin", (schema: any, request) => {
        let login = request.params.userLogin;

        return schema.users.where({ login });
      });

      this.post("http://localhost:8080/api/users", (schema: any, request) => {
        const attrs = {
          ...JSON.parse(request.requestBody),
          activated: true,
        };
        return schema.users.create(attrs);
      });

      this.put("http://localhost:8080/api/users", (schema: any, request) => {
        console.log({schema}, {request});
        return {};
      });

      this.passthrough();
    }
  })
}

 */
