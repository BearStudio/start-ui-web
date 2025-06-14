import { Meta } from '@storybook/react-vite';

import { Logo } from '@/components/brand/logo';

export default {
  title: 'Brand/Logo',
} satisfies Meta<typeof Logo>;

export const Default = () => {
  return <Logo className="w-32" />;
};

export const Color = () => {
  return <Logo className="w-32 text-neutral-400" />;
};
