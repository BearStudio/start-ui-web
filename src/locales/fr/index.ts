import 'dayjs/locale/fr.js';

import account from './account.json' with { type: 'json' };
import auth from './auth.json' with { type: 'json' };
import book from './book.json' with { type: 'json' };
import buildInfo from './build-info.json' with { type: 'json' };
import common from './common.json' with { type: 'json' };
import components from './components.json' with { type: 'json' };
import demo from './demo.json' with { type: 'json' };
import emails from './emails.json' with { type: 'json' };
import genre from './genre.json' with { type: 'json' };
import layout from './layout.json' with { type: 'json' };
import user from './user.json' with { type: 'json' };

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
} as const;
