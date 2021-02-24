import { Response } from 'miragejs';

import { getCurrent } from '@/mocks/account';

export const AuthRoutes = (server) => {
  server.post('/authenticate', authenticate);
};

const authenticate = (schema, request) => {
  const attrs = JSON.parse(request.requestBody);
  const user = schema.users.findBy({ login: attrs.username.toLowerCase() });
  if (!user) {
    return new Response(401);
  } else {
    // Hack to identify current user
    return { id_token: user.id };
  }
};

export const withAuth = (callback) => {
  return (schema, request) => {
    if (getCurrent(schema, request).code === 401) {
      return new Response(401);
    }
    return callback(schema, request);
  };
};
