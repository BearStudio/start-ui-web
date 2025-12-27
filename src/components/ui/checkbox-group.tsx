import { CheckboxGroup as CheckboxGroupPrimitive } from '@base-ui/react/checkbox-group';

import { cn } from '@/lib/tailwind/utils';

type CheckboxGroupProps = CheckboxGroupPrimitive.Props;
export function CheckboxGroup({ className, ...props }: CheckboxGroupProps) {
  return (
    <CheckboxGroupPrimitive
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}
