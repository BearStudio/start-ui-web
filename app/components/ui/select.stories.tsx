import { Combobox } from '@ark-ui/react/combobox';
import { Meta } from '@storybook/react';
import { ArrowDown } from 'lucide-react';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

export default {
  title: 'Select',
} satisfies Meta<typeof Select>;

const astrobears = [
  {
    value: 'bearstrong',
    label: 'Bearstrong',
  },
  {
    value: 'pawdrin',
    label: 'Buzz Pawdrin',
  },
  {
    value: 'grizzlyrin',
    label: 'Yuri Grizzlyrin',
  },
  {
    value: 'jemibear',
    label: 'Mae Jemibear',
    disabled: true,
  },
  {
    value: 'ridepaw',
    label: 'Sally Ridepaw',
  },
];

export const Default = () => {
  return <Select options={astrobears} />;
};

export const WithDefaultValue = () => {
  return <Select options={astrobears} defaultValue={['pawdrin']} />;
};

export const Placeholder = () => {
  return <Select options={astrobears} placeholder="Please select an option" />;
};

export const Disabled = () => {
  return <Select options={astrobears} disabled />;
};

export const IsError = () => {
  return <Select options={astrobears} invalid />;
};

export const Multiple = () => {
  return <Select options={astrobears} multiple />;
};

export const Customization = () => {
  return (
    <Select
      options={astrobears}
      inputProps={{
        endElement: (
          <Combobox.Trigger asChild>
            <Button variant="ghost" className="-me-1.5" size="icon-xs">
              <ArrowDown />
            </Button>
          </Combobox.Trigger>
        ),
        inputClassName: cn('data-[state=open]:bg-[#C0FFEE]'),
      }}
    />
  );
};
