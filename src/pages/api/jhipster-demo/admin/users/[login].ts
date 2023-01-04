import { getUserByLogin } from '@/server/users';
import { apiMethods, badRequestResponse } from '@/server/utils/api';

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
});
