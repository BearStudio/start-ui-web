import { Response } from 'miragejs';

import { withAuth } from '../auth';

export const UsersRoutes = (server) => {
  server.get('/users', getAll);
  server.get('/users/:userLogin', getOneByLogin);
  server.post('/users', create);
  server.put('/users', update);
  server.delete('/users/:userLogin', deleteOne);
};

const getAll = withAuth((schema, request) => {
  const users = schema.all('user');
  return new Response(200, { 'x-total-count': users.length.toString() }, users);
});

const getOneByLogin = withAuth((schema, request) => {
  const login = request.params.userLogin;
  return schema.where('user', { login }).models[0];
});

const create = withAuth((schema, request) => {
  const attrs = JSON.parse(request.requestBody);
  return schema.create('user', {
    activated: true,
    ...attrs,
  });
});

const update = withAuth((schema, request) => {
  const attrs = JSON.parse(request.requestBody);
  return schema.users.find(attrs.id).update(attrs);
});

const deleteOne = withAuth((schema, request) => {
  return schema.users.find(request.params.id).destroy();
});
