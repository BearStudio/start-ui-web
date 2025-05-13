import { useStore } from '@tanstack/react-form';
import { ComponentProps } from 'react';
import { isNullish } from 'remeda';

import { useFieldContext } from '@/lib/form/context';
import { cn } from '@/lib/tailwind/utils';

import { FormFieldError } from '@/components/form';
import { NumberInput } from '@/components/ui/number-input';

export default function FieldNumber(
  props: ComponentProps<typeof NumberInput> & {
    containerProps?: ComponentProps<'div'>;
    inCents?: boolean;
  }
) {
  const { containerProps, inCents, ...rest } = props;

  const field = useFieldContext<number | undefined | null>();

  const meta = useStore(field.store, (state) => ({
    id: state.meta.id,
    descriptionId: state.meta.descriptionId,
    errorId: state.meta.errorId,
    error: state.meta.errors[0],
  }));

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
    <div
      {...containerProps}
      className={cn('flex flex-1 flex-col gap-1', containerProps?.className)}
    >
      <NumberInput
        id={meta.id}
        aria-invalid={meta.error ? true : undefined}
        aria-describedby={
          !meta.error
            ? `${meta.descriptionId}`
            : `${meta.descriptionId} ${meta.errorId}`
        }
        {...rest}
        value={formatValue(field.state.value, 'from-cents')}
        onValueChange={(value) => {
          field.handleChange(formatValue(value, 'to-cents'));
          rest.onValueChange?.(value);
        }}
        onBlur={(e) => {
          field.handleBlur();
          rest.onBlur?.(e);
        }}
      />
      <FormFieldError />
    </div>
  );
}
