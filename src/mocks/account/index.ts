export const AccountRoutes = (server) => {
  server.get('http://localhost:8080/api/account', getCurrent);
  server.put('/api/users/:id', update);
};

const getCurrent = (schema) => {
  const user = schema.first('user');
  return {
    content: user.models,
  };
};

const update = (schema, request) => {
  const attrs = JSON.parse(request.requestBody);
  return schema.users.update({ id: request.params.id }, { ...attrs })[0];
};
