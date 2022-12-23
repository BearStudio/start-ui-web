import { getUserList } from '@/server/users';
import { apiMethods } from '@/server/utils/api';

export default apiMethods({
  GET: {
    handler: async ({ res }) => {
      const data = await getUserList();
      res.json(data);
    },
  },
});
