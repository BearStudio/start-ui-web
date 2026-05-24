import { MailIcon } from 'lucide-react';

import { Input } from '@/platform/components/ui/input';
import { InputGroupText } from '@/platform/components/ui/input-group';
const Default = () => {
  return <Input placeholder="Placeholder..." />;
};

const Invalid = () => {
  return <Input aria-invalid placeholder="Placeholder..." />;
};

const Disabled = () => {
  return <Input disabled placeholder="Placeholder..." />;
};

const ReadOnly = () => {
  return <Input readOnly placeholder="Placeholder..." />;
};

const Sizes = () => {
  return (
    <div className="flex flex-col gap-4">
      <Input size="sm" placeholder="Small" />
      <Input placeholder="Default" />
      <Input size="lg" placeholder="Large" />
    </div>
  );
};
const StartEndAddons = () => {
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

export default {
  Default,
  Invalid,
  Disabled,
  ReadOnly,
  Sizes,
  StartEndAddons,
};
