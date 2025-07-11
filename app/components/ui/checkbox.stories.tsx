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

export const Disabled = () => {
  return <Checkbox disabled>I love bears</Checkbox>;
};

export const CustomCheckbox = () => {
  return (
    <label className="relative flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-border p-4 transition-colors outline-none focus-within:ring-[3px] focus-within:ring-ring/50 hover:bg-muted/50 has-[&[data-checked]]:bg-primary/5">
      <Checkbox
        noLabel
        render={(props, { checked }) => {
          return (
            <div
              {...props}
              className="flex w-full justify-between outline-none"
            >
              <div className="flex flex-col">
                <span className="font-medium">I love bears</span>
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
};
