export { authClient } from './presentation/client';
export {
  AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES,
  AUTH_EMAIL_OTP_MOCKED,
  AUTH_SIGNUP_ENABLED,
} from './presentation/config';
export { ConfirmSignOut } from './presentation/confirm-signout';
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
export { WithPermissions } from './presentation/with-permissions';
