import { isNullish } from 'remeda';

import { useFormField } from '@/components/new-form/form-field';
import { FormFieldContainer } from '@/components/new-form/form-field-container';
import { useFormFieldController } from '@/components/new-form/form-field-controller/context';
import { FormFieldError } from '@/components/new-form/form-field-error';
import { FieldProps } from '@/components/new-form/types';
import { NumberInput } from '@/components/ui/number-input';

export type FieldNumberProps = FieldProps<
  {
    containerProps?: React.ComponentProps<typeof FormFieldContainer>;
    inCents?: boolean;
  } & React.ComponentProps<typeof NumberInput>
>;

export const FieldNumber = (props: FieldNumberProps) => {
  const { containerProps, inCents, ...rest } = props;

  const ctx = useFormField();
  const { field, fieldState, displayError } = useFormFieldController();
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

  const { onChange, value, ...fieldProps } = field;
  return (
    <FormFieldContainer {...containerProps}>
      <NumberInput
        id={ctx.id}
        invalid={fieldState.error ? true : undefined}
        aria-describedby={
          !fieldState.error
            ? `${ctx.descriptionId}`
            : `${ctx.descriptionId} ${ctx.errorId}`
        }
        {...rest}
        {...fieldProps}
        value={formatValue(value, 'from-cents')}
        onValueChange={(value) => {
          onChange(formatValue(value, 'to-cents'));
          rest.onValueChange?.(value);
        }}
        onBlur={(e) => {
          field.onBlur();
          rest.onBlur?.(e);
        }}
      />
      {fieldState.invalid && displayError && (
        <FormFieldError errors={[fieldState.error]} />
      )}
    </FormFieldContainer>
  );
};
