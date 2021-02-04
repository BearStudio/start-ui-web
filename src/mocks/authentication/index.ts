import { Response } from 'miragejs';

export const AuthRoutes = (server) => {
  server.post('/authenticate', authenticate);
  server.post('/register', register);
};

const authenticate = (schema, request) => {
  const attrs = JSON.parse(request.requestBody);
  const user = schema.users.findBy({ login: attrs.username });
  if (user) {
    // Hack to identify current user
    return new Response(200, {}, { id_token: user.id });
  } else {
    return new Response(401);
  }
};

const register = (schema, request) => {
  const attrs = JSON.parse(request.requestBody);
  console.log({ attrs });
  schema.create('user', {
    ...attrs,
    activated: false,
  });
};
