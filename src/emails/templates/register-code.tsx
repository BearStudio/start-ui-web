import { BaseEmailCode, EmailCodeProps } from '../components/BaseEmailCode';

const EmailRegisterCode = (props: EmailCodeProps) => {
  return <BaseEmailCode type="registerCode" {...props} />;
};

export default EmailRegisterCode;
