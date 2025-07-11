import zod from 'zod-i18n-map/locales/ar/zod.json' assert { type: 'json' };
import 'dayjs/locale/ar.js';

import account from './account.json' assert { type: 'json' };
import auth from './auth.json' assert { type: 'json' };
import book from './book.json' assert { type: 'json' };
import buildInfo from './build-info.json' assert { type: 'json' };
import common from './common.json' assert { type: 'json' };
import components from './components.json' assert { type: 'json' };
import demo from './demo.json' assert { type: 'json' };
import emails from './emails.json' assert { type: 'json' };
import genre from './genre.json' assert { type: 'json' };
import layout from './layout.json' assert { type: 'json' };
import user from './user.json' assert { type: 'json' };

export default {
  account,
  auth,
  book,
  buildInfo,
  common,
  components,
  demo,
  emails,
  genre,
  layout,
  user,
  zod,
} as const;
