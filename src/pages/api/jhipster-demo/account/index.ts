import { z } from 'zod';

import { updateAccount } from '@/server/account';
import {
  apiMethods,
  badRequestResponse,
  notSignedInResponse,
} from '@/server/utils/api';

export default apiMethods({
  GET: {
    handler: async ({ res, user }) => {
      return res.json(user);
    },
  },
  POST: {
    handler: async ({ req, res, user }) => {
      if (!user?.id) {
        return notSignedInResponse(res);
      }
      const bodyParsed = z
        .object({
          email: z.string().email(),
          firstName: z.string().nullable(),
          lastName: z.string().nullable(),
          langKey: z.string(),
        })
        .safeParse(req.body);

      if (!bodyParsed.success) {
        return badRequestResponse(res);
      }

      const updatedUser = await updateAccount(user.id, bodyParsed.data);
      return res.json(updatedUser);
    },
  },
});
