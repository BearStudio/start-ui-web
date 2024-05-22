import { BaseEmailCode, EmailCodeProps } from '../components/BaseEmailCode';

export const EmailAddressChange = (props: EmailCodeProps) => {
  return <BaseEmailCode type="emailAddressChange" {...props} />;
};

export default EmailAddressChange;
