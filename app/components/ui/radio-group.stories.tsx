import type { Meta } from '@storybook/react-vite';
import { CheckIcon } from 'lucide-react';
import { useId } from 'react';

import { cn } from '@/lib/tailwind/utils';

import { Radio, RadioGroup } from '@/components/ui/radio-group';

export default {
  title: 'RadioGroup',
} satisfies Meta<typeof RadioGroup>;

const astrobears = [
  { value: 'bearstrong', label: 'Bearstrong' },
  { value: 'pawdrin', label: 'Buzz Pawdrin' },
  { value: 'grizzlyrin', label: 'Yuri Grizzlyrin' },
] as const;

export const Default = () => {
  const radioGroupId = useId();
  return (
    <RadioGroup>
      {astrobears.map(({ value, label }) => {
        return (
          <Radio key={`${radioGroupId}-${value}`} value={value}>
            {label}
          </Radio>
        );
      })}
    </RadioGroup>
  );
};

export const DefaultValue = () => {
  const radioGroupId = useId();
  return (
    <RadioGroup defaultValue={astrobears[1].value}>
      {astrobears.map(({ value, label }) => {
        return (
          <Radio key={`${radioGroupId}-${value}`} value={value}>
            {label}
          </Radio>
        );
      })}
    </RadioGroup>
  );
};

export const Disabled = () => {
  const radioGroupId = useId();
  return (
    <RadioGroup defaultValue={astrobears[1].value} disabled>
      {astrobears.map(({ value, label }) => {
        return (
          <Radio key={`${radioGroupId}-${value}`} value={value}>
            {label}
          </Radio>
        );
      })}
    </RadioGroup>
  );
};

export const Row = () => {
  const radioGroupId = useId();
  return (
    <RadioGroup className="flex-row gap-4">
      {astrobears.map(({ value, label }) => {
        return (
          <Radio key={`${radioGroupId}-${value}`} value={value}>
            {label}
          </Radio>
        );
      })}
    </RadioGroup>
  );
};

export const WithCustomRadio = () => {
  const radioGroupId = useId();
  return (
    <RadioGroup>
      {astrobears.map(({ value, label }) => {
        const radioId = `${radioGroupId}-${value}`;
        return (
          <label
            className="relative flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-border p-4 transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:outline-none hover:bg-muted/50 has-[&[data-checked]]:border-primary/90 has-[&[data-checked]]:bg-primary/5"
            key={radioId}
          >
            <Radio
              value={value}
              noLabel
              render={(props, { checked }) => {
                return (
                  <div
                    {...props}
                    className="flex w-full justify-between outline-none"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{label}</span>
                    </div>
                    <div
                      className={cn('rounded-full bg-primary p-1 opacity-0', {
                        'opacity-100': checked,
                      })}
                    >
                      <CheckIcon className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                );
              }}
            />
          </label>
        );
      })}
    </RadioGroup>
  );
};
