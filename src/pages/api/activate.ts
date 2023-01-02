import { z } from 'zod';

import { activateAccount } from '@/server/account';
import {
  apiMethods,
  badRequestResponse,
  demoReadOnlyResponse,
} from '@/server/utils/api';

export default apiMethods({
  GET: {
    public: true,
    handler: async ({ req, res }) => {
      if (process.env.NEXT_PUBLIC_IS_DEMO === 'true') {
        return demoReadOnlyResponse(res);
      }

      const queryParsed = z.object({ key: z.string() }).safeParse(req.query);

      if (!queryParsed.success) {
        return badRequestResponse(res);
      }

      const user = await activateAccount({
        token: queryParsed.data.key,
      });

      if (!user) {
        return badRequestResponse(res);
      }

      return res.status(200).end();
    },
  },
});
