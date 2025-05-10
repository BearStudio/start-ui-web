import zod from 'zod-i18n-map/locales/en/zod.json' assert { type: 'json' }; // Using English as fallback since Swahili is not available in zod-i18n-map
import 'dayjs/locale/sw.js'; // If available, otherwise use 'dayjs/locale/en'

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
