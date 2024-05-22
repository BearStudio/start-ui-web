import { BaseEmailCode, EmailCodeProps } from '../components/BaseEmailCode';

export const EmailLoginCode = (props: EmailCodeProps) => {
  return <BaseEmailCode type="loginCode" {...props} />;
};

export default EmailLoginCode;
