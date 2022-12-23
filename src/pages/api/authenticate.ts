import { z } from 'zod';

import { login } from '@/server/auth';
import { apiMethods, badRequest } from '@/server/utils/api';

export default apiMethods({
  POST: {
    public: true,
    handler: async ({ req, res }) => {
      const bodyParsed = z
        .object({ username: z.string(), password: z.string() })
        .safeParse(req.body);

      if (!bodyParsed.success) {
        return badRequest(res);
      }

      const token = await login({
        login: bodyParsed.data.username,
        password: bodyParsed.data.password,
      });
      if (!token) {
        return badRequest(res);
      }

      return res.json({ id_token: token });
    },
  },
});
