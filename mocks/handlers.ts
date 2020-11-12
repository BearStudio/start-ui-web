import { rest } from 'msw';
import { getUser, getAdmin } from './data/users';

const fakeDelay = 500;
const fakeToken = 'FAKE_TOKEN';
let loggedUser = getUser();

const withAuth = (callback) => {
  return (req, res, ctx) => {
    const authToken = req.headers.get('authorization');
    if (!authToken || !authToken.endsWith(fakeToken)) {
      return res(ctx.status(401));
    }
    return callback(req, res, ctx);
  };
};

export const handlers = [
  // POST /authenticate
  rest.post('/api/authenticate', async (req, res, ctx) => {
    const { username }: any = req.body;
    loggedUser = {
      ...(username === 'admin' ? getAdmin() : getUser()),
      login: username,
    };
    return res(
      ctx.delay(fakeDelay),
      ctx.status(200),
      ctx.json({ id_token: fakeToken })
    );
  }),

  // GET /account
  rest.get(
    '/api/account',
    withAuth(async (req, res, ctx) => {
      return res(ctx.delay(fakeDelay), ctx.status(200), ctx.json(loggedUser));
    })
  ),
];
