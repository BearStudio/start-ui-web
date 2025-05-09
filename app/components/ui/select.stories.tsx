import { faker } from '@faker-js/faker';
import { ComboboxButton } from '@headlessui/react';
import { Meta } from '@storybook/react';
import { ArrowDown } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

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
    <Select options={astrobears} value={bear} onChange={(v) => setBear(v)} />
  );
};

export const WithDefaultValue = () => {
  const [bear, setBear] = useState<Bear | null>({
    id: 'bearstrong',
    label: 'Bearstrong',
  });

  return (
    <Select options={astrobears} value={bear} onChange={(v) => setBear(v)} />
  );
};

export const WithClearButton = () => {
  const [bear, setBear] = useState<Bear | null>(null);

  return (
    <Select
      options={astrobears}
      value={bear}
      onChange={(v) => setBear(v)}
      withClearButton
    />
  );
};

export const AllowCustomValue = () => {
  const [bear, setBear] = useState<Bear | null>(null);

  return (
    <Select
      allowCustomValue
      options={astrobears}
      value={bear}
      onChange={(v) => setBear(v)}
    />
  );
};

export const Sizes = () => {
  const [bear, setBear] = useState<Bear | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <Select
        options={astrobears}
        value={bear}
        onChange={(v) => setBear(v)}
        size="sm"
      />
      <Select options={astrobears} value={bear} onChange={(v) => setBear(v)} />
      <Select
        options={astrobears}
        value={bear}
        onChange={(v) => setBear(v)}
        size="lg"
      />
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

export const Creatable = () => {
  const [bear, setBear] = useState<Bear | null>(null);

  return (
    <Select
      options={astrobears}
      allowCustomValue
      value={bear}
      onChange={(v) => setBear(v)}
    />
  );
};

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
