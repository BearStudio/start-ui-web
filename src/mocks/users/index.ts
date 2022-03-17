import { Response } from 'miragejs';

import { sortByKey } from '@/utils/arrays';

import { withAuth } from '../auth';

export const UsersRoutes = (server) => {
  server.get('/admin/users', getAll);
  server.get('/admin/users/:userLogin', getOneByLogin);
  server.post('/admin/users', create);
  server.put('/admin/users', update);
  server.delete('/admin/users/:userLogin', deleteOne);
};

const getAll = withAuth((schema, request) => {
  const { page = 1, size = 10, sort = '' } = request.queryParams;
  const start = page * size;
  const end = start + parseInt(size, 10);
  const users = schema.all('user');

  return new Response(
    200,
    { 'x-total-count': users.length.toString() },
    users.sort(sortByKey(sort.split(','))).slice(start, end)
  );
});

const getOneByLogin = withAuth((schema, request) => {
  const login = request.params.userLogin;
  const user = schema.where('user', { login }).models[0];
  if (!user) {
    return new Response(404);
  }
  return user;
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
  const login = request.params.userLogin;
  return schema.users.findBy({ login }).destroy();
});
