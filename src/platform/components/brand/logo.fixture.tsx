import { Logo } from '@/platform/components/brand/logo';
const Default = () => {
  return <Logo className="w-32" />;
};

const Color = () => {
  return <Logo className="w-32 text-neutral-400" />;
};

export default {
  Default,
  Color,
};
