import { Response } from 'miragejs';

export const UsersRoutes = (server) => {
  server.get('/api/users', getAll);
  server.get('/api/users/:userLogin', getOneByLogin);
  server.post('/api/users', create);
  server.put('/api/users/:id', update);
  server.delete('/api/users/:userLogin', deleteOne);
};

const getAll = (schema) => {
  const users = schema.all('user');

  return new Response(200, { 'x-total-count': users.length.toString() }, users);
};

const getOneByLogin = (schema, request) => {
  let login = request.params.userLogin;

  return schema.users.where({ login });
};

const create = (schema, request) => {
  const attrs = JSON.parse(request.requestBody);
  return schema.users.insert({
    activated: true,
    id: Math.random(),
    ...attrs,
  });
};

const update = (schema, request) => {
  const attrs = JSON.parse(request.requestBody);
  return schema.users.update({ id: request.params.id }, { ...attrs })[0];
};

const deleteOne = (schema, request) => {
  return {};
};
