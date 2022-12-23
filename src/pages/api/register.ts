import { z } from 'zod';

import { createAccount } from '@/server/account';
import { apiMethods, badRequest } from '@/server/utils/api';

export default apiMethods({
  POST: {
    public: true,
    handler: async ({ req, res }) => {
      const bodyParsed = z
        .object({
          email: z.string().email(),
          login: z.string().min(2),
          password: z.string().min(4),
          langKey: z.string(),
        })
        .safeParse(req.body);

      if (!bodyParsed.success) {
        return badRequest(res);
      }

      const user = await createAccount(bodyParsed.data);

      if (!user) {
        return res.status(500).end();
      }

      return res.json(user);
    },
  },
});
