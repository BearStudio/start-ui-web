import type { StoryDefault } from '@ladle/react';

import { Logo } from '@/components/brand/logo';

export default {
  title: 'Brand/Logo',
} satisfies StoryDefault;

export const Default = () => {
  return <Logo className="w-32" />;
};

export const Color = () => {
  return <Logo className="w-32 text-neutral-400" />;
};
