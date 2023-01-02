import { getUser } from '@/server/users';
import { apiMethods, badRequestResponse } from '@/server/utils/api';

export default apiMethods({
  GET: {
    handler: async ({ req, res }) => {
      if (typeof req.query.id !== 'string') {
        return badRequestResponse(res);
      }
      const data = await getUser(Number(req.query.id));
      res.json(data);
    },
  },
});
