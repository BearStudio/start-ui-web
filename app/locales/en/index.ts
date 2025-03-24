import zod from 'zod-i18n-map/locales/en/zod.json';
import 'dayjs/locale/en';

import auth from './auth.json';
import common from './common.json';
import components from './components.json';
import emails from './emails.json';
import repository from './repository.json';
export default {
  auth,
  common,
  components,
  emails,
  repository,
  zod,
} as const;
