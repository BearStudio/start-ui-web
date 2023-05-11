import { z } from 'zod';

import { resetPasswordInit } from '@/mock-server/account';
import { apiMethods, badRequestResponse } from '@/mock-server/utils/api';

export default apiMethods({
  POST: {
    public: true,
    handler: async ({ req, res }) => {
      const bodyParsed = z.string().email().safeParse(req.body);

      if (!bodyParsed.success) {
        return badRequestResponse(res);
      }

      await resetPasswordInit(bodyParsed.data);
      res.end();
    },
  },
});
