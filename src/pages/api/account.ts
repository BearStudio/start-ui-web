import { apiMethods } from '@/server/utils/api';

export default apiMethods({
  GET: {
    handler: async ({ res, user }) => {
      return res.json(user);
    },
  },
});
