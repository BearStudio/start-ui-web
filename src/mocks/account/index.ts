import { Request, Response, Server } from 'miragejs';

export const AccountRoutes = (server: Server) => {
  server.get('/account', getCurrent);
  server.post('/account', update);
  server.post('/account/change-password', changePassword);
  server.post('/account/reset-password/init', initResetPassword);
  server.post('/account/reset-password/finish', finishResetPassword);
  server.post('/register', register);
};

export const getCurrent = (schema: any, request: Request) => {
  const authToken = request.requestHeaders.Authorization;
  const userIdFromToken = authToken?.split('Bearer ')[1];

  if (!userIdFromToken || !['1', '2'].includes(userIdFromToken)) {
    return new Response(401);
  }
  return schema.users.find(userIdFromToken);
};

const register = (schema: any, request: Request) => {
  const attrs = JSON.parse(request.requestBody);
  schema.create('user', {
    ...attrs,
    activated: false,
  });
  return '';
};

const update = (schema: any, request: Request) => {
  const attrs = JSON.parse(request.requestBody);
  const authToken = request.requestHeaders.Authorization;
  const userId = authToken?.split('Bearer ')[1];

  return schema.users.find(userId).update(attrs);
};

const initResetPassword = (_: any, request: Request) => {
  return request.requestBody;
};

const finishResetPassword = (schema: any, request: Request) => {
  const { key, newPassword } = JSON.parse(request.requestBody);
  return schema.users.find(key).update({ password: newPassword });
};

const changePassword = (schema: any, request: Request) => {
  const attrs = JSON.parse(request.requestBody);
  const authToken = request.requestHeaders.Authorization;
  const userId = authToken?.split('Bearer ')[1];

  return schema.users.find(userId).update({ ...attrs });
};
