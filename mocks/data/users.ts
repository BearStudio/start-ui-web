export const getUsers = () => [
  {
    id: 1,
    login: 'user',
    email: 'user@example.com',
    firstName: '',
    lastName: '',
    langKey: 'en',
    activated: true,
    authorities: ['ROLE_USER'],
  },
  {
    id: 2,
    login: 'admin',
    email: 'admin@example.com',
    firstName: '',
    lastName: '',
    langKey: 'en',
    activated: true,
    authorities: ['ROLE_USER', 'ROLE_ADMIN'],
  },
];

export const getUser = () => getUsers()[0];
export const getAdmin = () => getUsers()[1];
