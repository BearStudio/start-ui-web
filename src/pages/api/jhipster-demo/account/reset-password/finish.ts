import { z } from 'zod';

import { resetPasswordFinish } from '@/server/account';
import { apiMethods, badRequestResponse } from '@/server/utils/api';

export default apiMethods({
  POST: {
    public: true,
    handler: async ({ req, res }) => {
      const bodyParsed = z
        .object({
          key: z.string(),
          newPassword: z.string(),
        })
        .safeParse(req.body);

      if (!bodyParsed.success) {
        return badRequestResponse(res);
      }

      const user = await resetPasswordFinish({
        token: bodyParsed.data.key,
        newPassword: bodyParsed.data.newPassword,
      });

      if (!user) {
        return badRequestResponse(res, { title: 'Invalid token' });
      }

      res.json(user);
    },
  },
});
