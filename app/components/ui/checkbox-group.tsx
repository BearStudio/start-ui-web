import { CheckboxGroup as CheckboxGroupPrimitive } from '@base-ui-components/react/checkbox-group';

import { cn } from '@/lib/tailwind/utils';

export type CheckboxGroupProps = CheckboxGroupPrimitive.Props;

export function CheckboxGroup(props: CheckboxGroupProps) {
  return (
    <CheckboxGroupPrimitive
      {...props}
      className={cn(
        'className="flex flex-col items-start gap-1',
        props?.className
      )}
    />
  );
}
