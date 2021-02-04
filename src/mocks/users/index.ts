import { Response } from 'miragejs';

import { isAuthorizedRequest } from '../account';

export const UsersRoutes = (server) => {
  server.get('/users', getAll);
  server.get('/users/:userLogin', getOneByLogin);
  server.post('/users', create);
  server.put('/users', update);
  server.delete('/users/:userLogin', deleteOne);
};

const getAll = (schema, request) => {
  if (!isAuthorizedRequest(schema, request)) {
    return new Response(401);
  }

  const users = schema.all('user');
  return new Response(200, { 'x-total-count': users.length.toString() }, users);
};

const getOneByLogin = (schema, request) => {
  if (!isAuthorizedRequest(schema, request)) {
    return new Response(401);
  }

  const login = request.params.userLogin;
  return schema.where('user', { login }).models[0];
};

const create = (schema, request) => {
  if (!isAuthorizedRequest(schema, request)) {
    return new Response(401);
  }

  const attrs = JSON.parse(request.requestBody);
  return schema.create('user', {
    activated: true,
    ...attrs,
  });
};

const update = (schema, request) => {
  if (!isAuthorizedRequest(schema, request)) {
    return new Response(401);
  }

  const attrs = JSON.parse(request.requestBody);
  return schema.users.find(attrs.id).update(attrs);
};

const deleteOne = (schema, request) => {
  if (!isAuthorizedRequest(schema, request)) {
    return new Response(401);
  }

  return schema.users.find(request.params.id).destroy();
};
