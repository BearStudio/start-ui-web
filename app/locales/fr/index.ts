import zod from 'zod-i18n-map/locales/fr/zod.json' assert { type: 'json' };
import 'dayjs/locale/fr.js';

import auth from './auth.json' assert { type: 'json' };
import common from './common.json' assert { type: 'json' };
import components from './components.json' assert { type: 'json' };
import emails from './emails.json' assert { type: 'json' };
import repository from './repository.json' assert { type: 'json' };
export default {
  auth,
  common,
  components,
  emails,
  repository,
  zod,
} as const;
