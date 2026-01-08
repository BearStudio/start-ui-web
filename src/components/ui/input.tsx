import { InputGroup, InputGroupInput } from '@/components/ui/input-group';

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
  };

function Input({ ref, size, ...props }: InputProps) {
  return (
    <InputGroup size={size}>
      <InputGroupInput {...props} ref={ref} data-slot="input" />
    </InputGroup>
  );
}

export { Input };
