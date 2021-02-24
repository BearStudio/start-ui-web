import { Response } from 'miragejs';

export const AccountRoutes = (server) => {
  server.get('/account', getCurrent);
  server.post('/account', update);
  server.post('/account/change-password', changePassword);
  server.post('/account/reset-password/init', initResetPassword);
  server.post('/account/reset-password/finish', finishResetPassword);
  server.post('/register', register);
};

export const getCurrent = (schema, request) => {
  const authToken = request.requestHeaders.Authorization;
  const userIdFromToken = authToken?.split('Bearer ')[1];

  if (!userIdFromToken || !['1', '2'].includes(userIdFromToken)) {
    return new Response(401);
  }
  return schema.users.find(userIdFromToken);
};

const register = (schema, request) => {
  const attrs = JSON.parse(request.requestBody);
  schema.create('user', {
    ...attrs,
    activated: false,
  });
};

const update = (schema, request) => {
  const attrs = JSON.parse(request.requestBody);
  const authToken = request.requestHeaders.Authorization;
  const userId = authToken.split('Bearer ')[1];

  return schema.users.find(userId).update(attrs);
};

const initResetPassword = (_, request) => {
  return request.requestBody;
};

const finishResetPassword = (schema, request) => {
  const { key, newPassword } = JSON.parse(request.requestBody);
  return schema.users.find(key).update({ password: newPassword });
};

const changePassword = (schema, request) => {
  const attrs = JSON.parse(request.requestBody);
  const authToken = request.requestHeaders.Authorization;
  const userId = authToken.split('Bearer ')[1];

  return schema.users.find(userId).update({ ...attrs });
};
