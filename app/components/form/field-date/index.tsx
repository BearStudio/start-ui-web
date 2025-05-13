import { useStore } from '@tanstack/react-form';
import { ComponentProps } from 'react';

import { useFieldContext } from '@/lib/form/context';
import { cn } from '@/lib/tailwind/utils';

import { FormFieldError } from '@/components/form/form-field-error';
import { DatePicker } from '@/components/ui/date-picker';

export default function FieldDate(
  props: ComponentProps<typeof DatePicker> & {
    containerProps?: ComponentProps<'div'>;
  }
) {
  const { containerProps, ...rest } = props;

  const field = useFieldContext();

  const meta = useStore(field.store, (state) => ({
    id: state.meta.id,
    descriptionId: state.meta.descriptionId,
    errorId: state.meta.errorId,
    error: state.meta.errors[0],
  }));

  return (
    <div
      {...containerProps}
      className={cn('flex flex-1 flex-col gap-1', containerProps?.className)}
    >
      <DatePicker
        id={meta.id}
        aria-invalid={meta.error ? true : undefined}
        aria-describedby={
          !meta.error
            ? meta.descriptionId
            : `${meta.descriptionId} ${meta.errorId}`
        }
        {...rest}
        {...field}
        onChange={(e) => {
          field.handleChange(e);
          rest.onChange?.(e);
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
