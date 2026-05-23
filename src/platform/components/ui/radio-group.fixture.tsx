import { CheckIcon } from 'lucide-react';
import { useId } from 'react';

import { cn } from '@/platform/lib/tailwind/utils';

import { Radio, RadioGroup } from '@/platform/components/ui/radio-group';
const astrobears = [
  { value: 'bearstrong', label: 'Bearstrong' },
  { value: 'pawdrin', label: 'Buzz Pawdrin' },
  { value: 'grizzlyrin', label: 'Yuri Grizzlyrin' },
] as const;

const Default = () => {
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

const DefaultValue = () => {
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

const Disabled = () => {
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

const Sizes = () => {
  const radioGroupId = useId();
  return (
    <div className="flex flex-col gap-4">
      <RadioGroup defaultValue={astrobears[1].value}>
        {astrobears.map(({ value, label }) => {
          return (
            <Radio key={`${radioGroupId}-${value}`} value={value} size="sm">
              {label}
            </Radio>
          );
        })}
      </RadioGroup>
      <RadioGroup defaultValue={astrobears[1].value}>
        {astrobears.map(({ value, label }) => {
          return (
            <Radio
              key={`${radioGroupId}-${value}`}
              value={value}
              size="default"
            >
              {label}
            </Radio>
          );
        })}
      </RadioGroup>
      <RadioGroup defaultValue={astrobears[1].value}>
        {astrobears.map(({ value, label }) => {
          return (
            <Radio key={`${radioGroupId}-${value}`} value={value} size="lg">
              {label}
            </Radio>
          );
        })}
      </RadioGroup>
    </div>
  );
};

const Row = () => {
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

const WithCustomRadio = () => {
  return (
    <RadioGroup>
      {astrobears.map(({ value, label }) => {
        return (
          <Radio
            key={value}
            value={value}
            labelProps={{
              className:
                'relative flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-border p-4 transition-colors outline-none focus-within:ring-[3px] focus-within:ring-ring/50 hover:bg-muted/50 has-[:checked]:border-transparent has-[:checked]:bg-primary has-[:checked]:text-primary-foreground',
            }}
            render={(props, { checked }) => {
              return (
                <button
                  type="button"
                  {...props}
                  className="flex w-full items-center justify-between outline-none"
                >
                  <span className="font-medium">{label}</span>
                  <span
                    className={cn(
                      'rounded-full bg-primary-foreground p-1 opacity-0',
                      {
                        'opacity-100': checked,
                      }
                    )}
                  >
                    <CheckIcon className="size-4 text-primary" />
                  </span>
                </button>
              );
            }}
          />
        );
      })}
    </RadioGroup>
  );
};

export default {
  Default,
  DefaultValue,
  Disabled,
  Sizes,
  Row,
  WithCustomRadio,
};
