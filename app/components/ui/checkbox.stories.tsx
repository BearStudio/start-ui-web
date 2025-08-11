import type { Meta } from '@storybook/react-vite';
import { CheckIcon } from 'lucide-react';

import { cn } from '@/lib/tailwind/utils';

import { Checkbox } from '@/components/ui/checkbox';

export default {
  title: 'Checkbox',
} satisfies Meta<typeof Checkbox>;

export function Default() {
  return <Checkbox>I love bears</Checkbox>;
}

export const DefaultValue = () => {
  return <Checkbox defaultChecked>I love bears</Checkbox>;
};

export const Sizes = () => {
  return (
    <div className="flex flex-col gap-2">
      <Checkbox size="sm">I love bears</Checkbox>
      <Checkbox>I love bears</Checkbox>
      <Checkbox size="lg">I love bears</Checkbox>
    </div>
  );
};

export const Disabled = () => {
  return <Checkbox disabled>I love bears</Checkbox>;
};

export const Indeterminate = () => {
  return <Checkbox indeterminate>I love bears</Checkbox>;
};

export const CustomCheckbox = () => {
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
