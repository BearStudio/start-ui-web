import { z } from 'zod';

import { createUser, getUserList, updateUserById } from '@/server/users';
import { apiMethods, badRequestResponse } from '@/server/utils/api';

export default apiMethods({
  GET: {
    handler: async ({ res }) => {
      const { users, total } = await getUserList();
      res.setHeader('x-total-count', total).json(users);
    },
  },

  PUT: {
    handler: async ({ req, res }) => {
      const bodyParsed = z
        .object({
          id: z.number(),
          login: z.string().min(2),
          email: z.string().email(),
          firstName: z.string().nullable(),
          lastName: z.string().nullable(),
          langKey: z.string(),
          authorities: z.array(z.string()),
        })
        .safeParse(req.body);

      if (!bodyParsed.success) {
        return badRequestResponse(res);
      }

      const user = await updateUserById(bodyParsed.data.id, bodyParsed.data);
      res.json(user);
    },
  },

  POST: {
    handler: async ({ req, res }) => {
      const bodyParsed = z
        .object({
          login: z.string().min(2),
          email: z.string().email(),
          firstName: z.string().nullable(),
          lastName: z.string().nullable(),
          langKey: z.string(),
          authorities: z.array(z.string()),
          activated: z.boolean(),
        })
        .safeParse(req.body);

      if (!bodyParsed.success) {
        return badRequestResponse(res);
      }

      const user = await createUser(bodyParsed.data);
      res.json(user);
    },
  },
});
