import { CheckIcon } from 'lucide-react';

import { cn } from '@/platform/lib/tailwind/utils';

import { Checkbox } from '@/platform/components/ui/checkbox';
function Default() {
  return <Checkbox>I love bears</Checkbox>;
}

const DefaultValue = () => {
  return <Checkbox defaultChecked>I love bears</Checkbox>;
};

const Sizes = () => {
  return (
    <div className="flex flex-col gap-2">
      <Checkbox size="sm">I love bears</Checkbox>
      <Checkbox>I love bears</Checkbox>
      <Checkbox size="lg">I love bears</Checkbox>
    </div>
  );
};

const Disabled = () => {
  return <Checkbox disabled>I love bears</Checkbox>;
};

const Indeterminate = () => {
  return <Checkbox indeterminate>I love bears</Checkbox>;
};

const CustomCheckbox = () => {
  return (
    <Checkbox
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
            <span className="font-medium">I love bears</span>
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
};

export default {
  Default,
  DefaultValue,
  Sizes,
  Disabled,
  Indeterminate,
  CustomCheckbox,
};
