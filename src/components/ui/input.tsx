import { cn } from '@/lib/tailwind/utils';

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
    startElement?: React.ReactNode;
    endElement?: React.ReactNode;
    inputClassName?: string;
  };

function Input({
  ref,
  className,
  inputClassName,
  type,
  startElement,
  endElement,
  size,
  ...props
}: InputProps) {
  return (
    <InputGroup size={size}>
      {!!startElement && (
        <InputGroupAddon align="inline-start">{startElement}</InputGroupAddon>
      )}
      <InputGroupInput
        {...props}
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          'flex h-full w-full outline-none',
          'disabled:cursor-not-allowed',
          'read-only:cursor-not-allowed',
          inputClassName
        )}
      />
      {!!endElement && (
        <InputGroupAddon align="inline-end">{endElement}</InputGroupAddon>
      )}
    </InputGroup>
  );
}

export { Input };
