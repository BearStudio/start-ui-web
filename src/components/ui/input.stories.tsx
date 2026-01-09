import type { Meta } from '@storybook/react-vite';
import { MailIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { InputGroupText } from '@/components/ui/input-group';

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
export const StartEndAddons = () => {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm">
        See <strong>InputGroup</strong> for more advanced use cases
      </p>
      <Input
        startAddon={<MailIcon />}
        defaultValue="Icon start"
        placeholder="Placeholder..."
      />
      <Input
        endAddon={<MailIcon />}
        defaultValue="Icon end"
        placeholder="Placeholder..."
      />
      <Input
        startAddon={<MailIcon />}
        endAddon={<MailIcon />}
        defaultValue="Icon start and end"
        placeholder="Placeholder..."
      />
      <Input
        startAddon={<InputGroupText>https://</InputGroupText>}
        defaultValue="Text start"
        placeholder="Placeholder..."
      />
      <Input
        endAddon={<InputGroupText>.com</InputGroupText>}
        defaultValue="Text end"
        placeholder="Placeholder..."
      />
    </div>
  );
};
