import { getUserByLogin, removeUserByLogin } from '@/mock-server/users';
import {
  apiMethods,
  badRequestResponse,
  notSignedInResponse,
} from '@/mock-server/utils/api';

export default apiMethods({
  GET: {
    admin: true,
    handler: async ({ req, res }) => {
      if (typeof req.query.login !== 'string') {
        return badRequestResponse(res);
      }
      const user = await getUserByLogin(req.query.login);
      res.json(user);
    },
  },
  DELETE: {
    admin: true,
    handler: async ({ req, res, user }) => {
      if (!user?.id) {
        return notSignedInResponse(res);
      }
      if (typeof req.query.login !== 'string') {
        return badRequestResponse(res);
      }

      await removeUserByLogin(req.query.login, user.id);
      res.end();
    },
  },
});
