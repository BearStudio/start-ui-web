import type { Meta } from '@storybook/react';

import { Radio, RadioGroup } from '@/components/ui/radio-group';

export default {
  title: 'Radio Group',
} satisfies Meta<typeof RadioGroup>;

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
  {
    value: 'michaelpawanderson',
    label: 'Michael Paw Anderson',
  },
] as const;

export const Default = () => {
  return (
    <RadioGroup>
      {astrobears.map(({ value, label }) => {
        return (
          <Radio key={value} value={value} id={value}>
            {label}
          </Radio>
        );
      })}
    </RadioGroup>
  );
};

export const DefaultValue = () => {
  return (
    <RadioGroup defaultValue={astrobears[1].value}>
      {astrobears.map(({ value, label }) => {
        return (
          <Radio key={value} value={value} id={value}>
            {label}
          </Radio>
        );
      })}
    </RadioGroup>
  );
};

export const Disabled = () => {
  return (
    <RadioGroup defaultValue={astrobears[1].value} disabled>
      {astrobears.map(({ value, label }) => {
        return (
          <Radio key={value} value={value} id={value}>
            {label}
          </Radio>
        );
      })}
    </RadioGroup>
  );
};

export const Row = () => {
  return (
    <RadioGroup className="flex-row gap-4">
      {astrobears.map(({ value, label }) => {
        return (
          <Radio key={value} value={value} id={value}>
            {label}
          </Radio>
        );
      })}
    </RadioGroup>
  );
};
