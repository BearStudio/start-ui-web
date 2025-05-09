import { Combobox } from '@ark-ui/react/combobox';
import { faker } from '@faker-js/faker';
import { Meta } from '@storybook/react';
import { ArrowDown } from 'lucide-react';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useState } from 'react';
import { ComboboxButton } from '@headlessui/react';

export default {
  title: 'Select',
} satisfies Meta<typeof Select>;

const astrobears = [
  {
    id: 'bearstrong',
    label: 'Bearstrong',
  },
  {
    id: 'pawdrin',
    label: 'Buzz Pawdrin',
  },
  {
    id: 'grizzlyrin',
    label: 'Yuri Grizzlyrin',
  },
  {
    id: 'jemibear',
    label: 'Mae Jemibear',
    disabled: true,
  },
  {
    id: 'ridepaw',
    label: 'Sally Ridepaw',
  },
  {
    id: 'michaelpawanderson',
    label: 'Michael Paw Anderson',
  },
] as const;

type Bear = (typeof astrobears)[number];

export const Default = () => {
  const [bear, setBear] = useState<Bear | null>(null);

  return (
    <Select
      options={astrobears}
      value={bear ?? undefined}
      onChange={(v) => setBear(v)}
    />
  );
};

export const WithDefaultValue = () => {
  return <Select options={astrobears} defaultValue={'pawdrin'} />;
};

export const WithClearButton = () => {
  const [bear, setBear] = useState<Bear | null>(null);
  return (
    <Select options={astrobears} defaultValue={'pawdrin'} withClearButton />
  );
};

export const AllowCustomValue = () => {
  const [bear, setBear] = useState<Bear | null>(null);

  return (
    <Select
      allowCustomValue
      options={astrobears}
      value={bear ?? undefined}
      onChange={(v) => setBear(v)}
    />
  );
};

export const Sizes = () => {
  return (
    <div className="flex flex-col gap-4">
      <Select options={astrobears} defaultValue={'pawdrin'} size="sm" />
      <Select options={astrobears} defaultValue={'pawdrin'} />
      <Select options={astrobears} defaultValue={'pawdrin'} size="lg" />
    </div>
  );
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

// export const Creatable = () => {
//   return <Select options={astrobears} allowCustomValue />;
// };

export const Customization = () => {
  return (
    <Select
      options={astrobears}
      inputProps={{
        endElement: (
          <ComboboxButton
            as={Button}
            variant="ghost"
            className="-me-1.5"
            size="icon-xs"
          >
            <ArrowDown />
          </ComboboxButton>
        ),
        inputClassName: cn('data-[state=open]:bg-[#C0FFEE]'),
      }}
      renderEmpty={(search) => (
        <div className="bg-negative-100">
          This is empty and your search is {search}
        </div>
      )}
    />
  );
};

const lotsOfOptions = Array.from({ length: 100_000 }, () => ({
  label: `${faker.person.firstName()} ${faker.person.lastName()}`,
  id: window.crypto.randomUUID(),
}));

export const LotsOfOptions = () => {
  return <Select options={lotsOfOptions} />;
};
