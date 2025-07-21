import { faker } from '@faker-js/faker';
import { ComboboxButton } from '@headlessui/react';
import { Meta } from '@storybook/react-vite';
import { ArrowDown, CheckIcon } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';
import { ComboboxOption, Select } from '@/components/ui/select';

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
    <div className="flex flex-col gap-2">
      <Select options={astrobears} value={bear} onChange={(v) => setBear(v)} />
      <div className="text-sm">
        Selected value: <pre>{JSON.stringify(bear)}</pre>
      </div>
    </div>
  );
};

export const RenderOption = () => {
  const [bear, setBear] = useState<Bear | null>(null);

  return (
    <Select
      options={astrobears}
      value={bear}
      onChange={(v) => setBear(v)}
      renderOption={(option) => (
        <ComboboxOption
          value={option}
          key={option.id}
          className="group relative"
        >
          <span>{option.label}</span>
          <span className="absolute inset-y-0 right-0 hidden items-center pe-4 group-data-[selected]:flex">
            <CheckIcon className="size-5" aria-hidden="true" />
          </span>
        </ComboboxOption>
      )}
    />
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
  const [bear, setBear] = useState<Bear | null>({
    id: 'bearstrong',
    label: 'Bearstrong',
  });

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
    <div className="flex flex-col gap-2">
      <Select
        allowCustomValue
        options={astrobears}
        value={bear}
        onChange={(v) => setBear(v)}
      />
      <div className="text-sm">
        Selected value: <pre>{JSON.stringify(bear)}</pre>
      </div>
    </div>
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
  const [bear, setBear] = useState<Bear | null>(null);

  return (
    <Select
      options={astrobears}
      value={bear}
      onChange={(v) => setBear(v)}
      placeholder="Please select an option"
    />
  );
};

export const Disabled = () => {
  const [bear, setBear] = useState<Bear | null>({
    id: 'bearstrong',
    label: 'Bearstrong',
  });

  return (
    <Select
      options={astrobears}
      disabled
      value={bear}
      onChange={(v) => setBear(v)}
    />
  );
};

export const ReadOnly = () => {
  const [bear, setBear] = useState<Bear | null>({
    id: 'bearstrong',
    label: 'Bearstrong',
  });

  return (
    <Select
      options={astrobears}
      readOnly
      value={bear}
      onChange={(v) => setBear(v)}
    />
  );
};

export const IsError = () => {
  const [bear, setBear] = useState<Bear | null>(null);

  return (
    <Select
      options={astrobears}
      aria-invalid
      value={bear}
      onChange={(v) => setBear(v)}
    />
  );
};

export const Customization = () => {
  const [bear, setBear] = useState<Bear | null>(null);

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
      value={bear}
      onChange={(v) => setBear(v)}
      renderEmpty={(search) => (
        <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
          This is empty and your search is "{search}"
        </div>
      )}
    />
  );
};

const lotsOfOptions = Array.from({ length: 10_000 }, () => ({
  label: `${faker.person.firstName()} ${faker.person.lastName()}`,
  id: window.crypto.randomUUID(),
}));

export const LotsOfOptions = () => {
  const [person, setPerson] = useState<{ id: string; label: string } | null>(
    null
  );

  return (
    <Select
      options={lotsOfOptions}
      value={person}
      onChange={(v) => setPerson(v)}
      mode="virtual"
    />
  );
};
