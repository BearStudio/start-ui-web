import { z } from 'zod';

import { createUser, getUserList, updateUserById } from '@/mock-server/users';
import { apiMethods, badRequestResponse } from '@/mock-server/utils/api';

export default apiMethods({
  GET: {
    handler: async ({ req, res }) => {
      const options = z
        .object({
          page: z.string().optional().default('0').transform(Number),
          size: z.string().optional().default('10').transform(Number),
        })
        .parse(req.query);
      const { users, total } = await getUserList({
        skip: options.page * options.size,
        take: options.size,
      });
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
          activated: z.boolean().optional(),
        })
        .safeParse(req.body);

      if (!bodyParsed.success) {
        return badRequestResponse(res);
      }

      const user = await createUser({ activated: true, ...bodyParsed.data });
      res.json(user);
    },
  },
});
