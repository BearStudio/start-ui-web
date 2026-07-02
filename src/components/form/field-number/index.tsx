import { isNullish } from 'remeda';

import { useFormField } from '@/components/form/form-field';
import { FormFieldContainer } from '@/components/form/form-field-container';
import { useFormFieldController } from '@/components/form/form-field-controller/context';
import { FormFieldError } from '@/components/form/form-field-error';
import { FieldProps } from '@/components/form/types';
import { NumberInput } from '@/components/ui/number-input';

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
  const { field, fieldState, isInvalid } = useFormFieldController();
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
        aria-invalid={isInvalid ? true : undefined}
        aria-describedby={ctx.describedBy(isInvalid)}
        {...rest}
        name={field.name}
        value={formatValue(fieldState.value, 'from-cents')}
        onValueChange={(value, event) => {
          field.handleChange(formatValue(value, 'to-cents'));
          rest.onValueChange?.(value, event);
        }}
        onBlur={(e) => {
          field.handleBlur();
          rest.onBlur?.(e);
        }}
      />
      <FormFieldError />
    </FormFieldContainer>
  );
};
