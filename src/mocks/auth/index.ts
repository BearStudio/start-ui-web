import { Request, Response, Server } from 'miragejs';

import { getCurrent } from '@/mocks/account';

export const AuthRoutes = (server: Server) => {
  server.post('/authenticate', authenticate);
};

const authenticate = (schema: any, request: Request) => {
  const attrs = JSON.parse(request.requestBody);
  const user = schema.users.findBy({ login: attrs.username.toLowerCase() });
  if (!user) {
    return new Response(401);
  }
  // Hack to identify current user
  return { id_token: user.id };
};

export const withAuth = (callback: any) => {
  return (schema: any, request: Request) => {
    if (getCurrent(schema, request).code === 401) {
      return new Response(401);
    }
    return callback(schema, request);
  };
};
