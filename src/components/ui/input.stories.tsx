import type { Meta } from '@storybook/react-vite';

import { Input } from '@/components/ui/input';

export default {
  title: 'Input',
} satisfies Meta<typeof Input>;

export const Default = () => {
  return <Input placeholder="Placeholder..." />;
};

export const Invalid = () => {
  return <Input aria-invalid placeholder="Placeholder..." />;
};

export const Disabled = () => {
  return <Input disabled placeholder="Placeholder..." />;
};

export const ReadOnly = () => {
  return <Input readOnly placeholder="Placeholder..." />;
};

export const Sizes = () => {
  return (
    <div className="flex flex-col gap-4">
      <Input size="sm" placeholder="Small" />
      <Input placeholder="Default" />
      <Input size="lg" placeholder="Large" />
    </div>
  );
};
