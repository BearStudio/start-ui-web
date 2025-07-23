import { CheckboxGroup as CheckboxGroupPrimitive } from '@base-ui-components/react/checkbox-group';

import { cn } from '@/lib/tailwind/utils';

export type BaseCheckboxGroupProps = CheckboxGroupPrimitive.Props;

export function CheckboxGroup(props: BaseCheckboxGroupProps) {
  return (
    <CheckboxGroupPrimitive
      {...props}
      className={cn('flex flex-col items-start gap-1', props?.className)}
    />
  );
}
