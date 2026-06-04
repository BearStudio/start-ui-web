import { createUseAuthSession } from './presentation/client';
import { createAuthQueryHooks } from './presentation/queries';
import { authQueries } from './presentation/wired-queries';
import { createWithPermissions } from './presentation/with-permissions';

export {
  type AuthClientResult,
  authErrorCodes,
  type AuthSignInProvider,
  checkRolePermission,
  signOut,
  startSignIn,
  type StartSignInInput,
  type StartSignInResult,
  verifyEmailOtp,
} from './presentation/client';
export {
  AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES,
  AUTH_EMAIL_OTP_MOCKED,
  AUTH_SIGNUP_ENABLED,
} from './presentation/config';
export { ConfirmSignOut } from './presentation/confirm-signout';
export {
  type AuthQueryFacade,
  clearAllQueryStateForAuthBoundary,
  createAuthQueries,
  createAuthQueryHooks,
} from './presentation/queries';
export type {
  FormFieldsLogin,
  FormFieldsLoginVerify,
  FormFieldsOnboarding,
} from './presentation/schema';
export {
  zFormFieldsLogin,
  zFormFieldsLoginVerify,
  zFormFieldsOnboarding,
} from './presentation/schema';
export { authQueries } from './presentation/wired-queries';

const authQueryHooks = createAuthQueryHooks(authQueries);

export const useCurrentSessionQuery = authQueryHooks.useCurrentSessionQuery;
export const useCurrentScopeKey = authQueryHooks.useCurrentScopeKey;
export const useAuthSession = createUseAuthSession(useCurrentSessionQuery);
export const WithPermissions = createWithPermissions(useAuthSession);
