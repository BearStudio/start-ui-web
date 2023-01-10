import { getUserByLogin, removeUserByLogin } from '@/server/users';
import {
  apiMethods,
  badRequestResponse,
  notSignedInResponse,
} from '@/server/utils/api';

export default apiMethods({
  GET: {
    handler: async ({ req, res }) => {
      if (typeof req.query.login !== 'string') {
        return badRequestResponse(res);
      }
      const user = await getUserByLogin(req.query.login);
      res.json(user);
    },
  },
  DELETE: {
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
