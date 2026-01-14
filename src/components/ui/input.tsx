import { ReactNode } from 'react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';

type InputProps = Pick<
  React.ComponentProps<'input'>,
  | 'type'
  | 'className'
  | 'placeholder'
  | 'id'
  | 'value'
  | 'defaultValue'
  | 'disabled'
  | 'readOnly'
  | 'aria-invalid'
  | 'aria-describedby'
  | 'autoFocus'
  | 'autoCapitalize'
  | 'autoComplete'
  | 'autoCorrect'
  | 'onBlur'
  | 'onChange'
  | 'onKeyDown'
  | 'inputMode'
> &
  Pick<React.ComponentProps<typeof InputGroup>, 'size'> & {
    ref?: React.Ref<HTMLInputElement | null>;
    startAddon?: ReactNode;
    endAddon?: ReactNode;
  };

function Input({
  ref,
  size,
  className,
  startAddon,
  endAddon,
  ...props
}: InputProps) {
  return (
    <InputGroup size={size} className={className}>
      {!!startAddon && (
        <InputGroupAddon align="inline-start">{startAddon}</InputGroupAddon>
      )}
      <InputGroupInput {...props} ref={ref} data-slot="input" />
      {!!endAddon && (
        <InputGroupAddon align="inline-end">{endAddon}</InputGroupAddon>
      )}
    </InputGroup>
  );
}

export { Input };
