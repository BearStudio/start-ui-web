import account from './account.json';
import admin from './admin.json';
import auth from './auth.json';
import common from './common.json';
import components from './components.json';
import emails from './emails.json';
import management from './management.json';
import repositories from './repositories.json';
import users from './users.json';

export default {
  account,
  management,
  auth,
  common,
  components,
  admin,
  emails,
  repositories,
  users,
} as const;
