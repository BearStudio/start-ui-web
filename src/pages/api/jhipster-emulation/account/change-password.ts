import { z } from 'zod';

import { updatePassword } from '@/server/account';
import {
  apiMethods,
  badRequestResponse,
  notSignedInResponse,
} from '@/server/utils/api';

export default apiMethods({
  POST: {
    handler: async ({ req, res, user }) => {
      if (!user?.id) {
        return notSignedInResponse(res);
      }

      const bodyParsed = z
        .object({
          currentPassword: z.string(),
          newPassword: z.string(),
        })
        .safeParse(req.body);

      if (!bodyParsed.success) {
        return badRequestResponse(res);
      }

      const updatedUser = await updatePassword(user.id, bodyParsed.data);

      if (!updatedUser) {
        return badRequestResponse(res);
      }

      return res.json(updatedUser);
    },
  },
});
