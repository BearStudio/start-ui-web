import { z } from 'zod';

import { login } from '@/server/auth';
import { apiMethods, badRequestResponse } from '@/server/utils/api';

export default apiMethods({
  POST: {
    demoAllowed: true,
    public: true,
    handler: async ({ req, res }) => {
      const bodyParsed = z
        .object({ username: z.string(), password: z.string() })
        .safeParse(req.body);

      if (!bodyParsed.success) {
        return badRequestResponse(res);
      }

      const token = await login({
        login: bodyParsed.data.username,
        password: bodyParsed.data.password,
      });
      if (!token) {
        return badRequestResponse(res);
      }

      return res.json({ id_token: token });
    },
  },
});
