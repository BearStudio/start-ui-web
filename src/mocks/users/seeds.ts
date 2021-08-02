export const userSeeds = (server) => {
  server.create('user', {
    login: 'admin',
    authorities: ['ROLE_ADMIN', 'ROLE_USER'],
  });
  server.create('user', { login: 'user', authorities: ['ROLE_USER'] });
  server.createList('user', 40);
};
