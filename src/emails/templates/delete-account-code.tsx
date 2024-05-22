import { BaseEmailCode, EmailCodeProps } from '../components/BaseEmailCode';

export const EmailDeleteAccountCode = (props: EmailCodeProps) => {
  return <BaseEmailCode type="deleteAccountCode" {...props} />;
};

export default EmailDeleteAccountCode;
