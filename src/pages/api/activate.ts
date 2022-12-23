import { z } from 'zod';

import { activateAccount } from '@/server/account';
import { apiMethods, badRequest } from '@/server/utils/api';

export default apiMethods({
  GET: {
    public: true,
    handler: async ({ req, res }) => {
      const queryParsed = z.object({ key: z.string() }).safeParse(req.query);

      if (!queryParsed.success) {
        return badRequest(res);
      }

      const user = await activateAccount({
        token: queryParsed.data.key,
      });

      if (!user) {
        return badRequest(res);
      }

      return res.status(200).end();
    },
  },
});
