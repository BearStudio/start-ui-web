import { Response } from 'miragejs';

export const AccountRoutes = (server) => {
  server.get('/account', getCurrent);
  server.post('/account', update);
  server.post('/account/change-password', changePassword);
  server.post('/account/reset-password/init', initResetPassword);
  server.post('/account/reset-password/finish', finishResetPassword);
};

export const isAuthorizedRequest = (schema, request) => {
  if (getCurrent(schema, request).code === 401) {
    return false;
  }
  return true;
};

const getCurrent = (schema, request) => {
  const authToken = request.requestHeaders.Authorization;
  if (authToken) {
    return schema.users.find(authToken.split('Bearer ')[1]);
  }
  return new Response(401);
};

const update = (schema, request) => {
  const attrs = JSON.parse(request.requestBody);
  const authToken = request.requestHeaders.Authorization;
  const userId = authToken.split('Bearer ')[1];

  return schema.users.find(userId).update(attrs);
};

const initResetPassword = (_, request) => {
  const email = request.requestBody;

  return email;
};

const finishResetPassword = (schema, request) => {
  const { key, newPassword } = JSON.parse(request.requestBody);
  return schema.users.find(key).update({ password: newPassword });
};

const changePassword = (schema, request) => {
  const attrs = JSON.parse(request.requestBody);
  console.log(attrs);
  const authToken = request.requestHeaders.Authorization;
  const userId = authToken.split('Bearer ')[1];

  return schema.users.find(userId).update({ ...attrs });
};
