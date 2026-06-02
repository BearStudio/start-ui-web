import { isNullish } from 'remeda';

import { FormFieldContainer } from '@/platform/components/form/form-field-container';
import { useFormField } from '@/platform/components/form/form-field-context';
import { FormFieldError } from '@/platform/components/form/form-field-error';
import { FieldProps } from '@/platform/components/form/types';
import { useTfField } from '@/platform/components/form/use-tf-field';
import { NumberInput } from '@/platform/components/ui/number-input';

export const FieldNumber = (
  props: FieldProps<
    {
      containerProps?: React.ComponentProps<typeof FormFieldContainer>;
      inCents?: boolean;
    } & React.ComponentProps<typeof NumberInput>
  >
) => {
  const { containerProps, inCents, ...rest } = props;

  const ctx = useFormField();
  const { field, fieldState } = useTfField<number | null>();
  const formatValue = (
    value: number | undefined | null,
    type: 'to-cents' | 'from-cents'
  ) => {
    if (isNullish(value)) return null;
    if (inCents !== true) return value ?? null;
    if (type === 'to-cents') return Math.round(value * 100);
    if (type === 'from-cents') return value / 100;
    return null;
  };

  return (
    <FormFieldContainer {...containerProps}>
      <NumberInput
        id={ctx.id}
        aria-invalid={fieldState.invalid ? true : undefined}
        aria-describedby={ctx.describedBy(fieldState.invalid)}
        {...rest}
        value={formatValue(field.value ?? null, 'from-cents')}
        disabled={rest.disabled}
        onValueChange={(value, event) => {
          field.onChange(formatValue(value, 'to-cents'));
          rest.onValueChange?.(value, event);
        }}
        onBlur={(e) => {
          field.onBlur();
          rest.onBlur?.(e);
        }}
      />
      <FormFieldError errors={fieldState.errors} />
    </FormFieldContainer>
  );
};
