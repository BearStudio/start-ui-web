import type { Meta } from '@storybook/react-vite';
import { ClockIcon } from 'lucide-react';

import { InputGroupButton, InputGroupText } from '@/components/ui/input-group';
import { TimeInput } from '@/components/ui/time-input';

export default {
  title: 'TimeInput',
} satisfies Meta<typeof TimeInput>;

export const Default = () => {
  return <TimeInput />;
};

export const WithDefaultValue = () => {
  return <TimeInput defaultValue={{ hour: 14, minute: 30 }} />;
};

export const Sizes = () => {
  return (
    <div className="flex flex-col gap-4">
      <TimeInput size="sm" defaultValue={{ hour: 9, minute: 0 }} />
      <TimeInput defaultValue={{ hour: 14, minute: 30 }} />
      <TimeInput size="lg" defaultValue={{ hour: 18, minute: 45 }} />
    </div>
  );
};

export const Invalid = () => {
  return <TimeInput isInvalid defaultValue={{ hour: 14, minute: 30 }} />;
};

export const Disabled = () => {
  return <TimeInput isDisabled defaultValue={{ hour: 14, minute: 30 }} />;
};

export const ReadOnly = () => {
  return <TimeInput isReadOnly defaultValue={{ hour: 14, minute: 30 }} />;
};

export const StartEndAddons = () => {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm">
        See <strong>InputGroup</strong> for more advanced use cases
      </p>
      <TimeInput
        startAddon={<ClockIcon />}
        defaultValue={{ hour: 9, minute: 0 }}
      />
      <TimeInput
        endAddon={<InputGroupText>UTC</InputGroupText>}
        defaultValue={{ hour: 14, minute: 30 }}
      />
      <TimeInput
        startAddon={<ClockIcon />}
        endAddon={<InputGroupText>UTC</InputGroupText>}
        defaultValue={{ hour: 18, minute: 45 }}
      />
    </div>
  );
};

export const SizesWithAddons = () => {
  return (
    <div className="flex flex-col gap-4">
      <TimeInput
        size="sm"
        startAddon={<ClockIcon />}
        defaultValue={{ hour: 9, minute: 0 }}
      />
      <TimeInput
        startAddon={<ClockIcon />}
        defaultValue={{ hour: 14, minute: 30 }}
      />
      <TimeInput
        size="lg"
        startAddon={<ClockIcon />}
        defaultValue={{ hour: 18, minute: 45 }}
      />
    </div>
  );
};

export const WithInputGroup = () => {
  return (
    <div className="flex flex-col gap-4">
      <TimeInput
        startAddon={<ClockIcon />}
        endAddon={
          <InputGroupButton size="icon-xs">
            <ClockIcon />
          </InputGroupButton>
        }
        defaultValue={{ hour: 14, minute: 30 }}
      />
      <TimeInput
        startAddon={<InputGroupText>Start</InputGroupText>}
        endAddon={<InputGroupText>hrs</InputGroupText>}
        defaultValue={{ hour: 9, minute: 0 }}
      />
    </div>
  );
};
