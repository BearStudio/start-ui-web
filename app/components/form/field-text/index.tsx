import { useStore } from '@tanstack/react-form';
import { ComponentProps } from 'react';

import { useFieldContext } from '@/lib/form/context';
import { cn } from '@/lib/tailwind/utils';

import { FormFieldError } from '@/components/form';
import { Input, InputProps } from '@/components/ui/input';

export default function FieldText(
  props: InputProps & { containerProps?: ComponentProps<'div'> }
) {
  const field = useFieldContext<string>();

  const meta = useStore(field.store, (state) => ({
    id: state.meta.id,
    descriptionId: state.meta.descriptionId,
    errorId: state.meta.errorId,
    error: state.meta.errors[0],
  }));

  const { containerProps, ...componentProps } = props;

  return (
    <div
      {...containerProps}
      className={cn('flex flex-1 flex-col gap-1', containerProps?.className)}
    >
      <Input
        id={meta.id}
        aria-invalid={meta.error ? true : undefined}
        aria-describedby={
          !meta.error
            ? `${meta.descriptionId}`
            : `${meta.descriptionId} ${meta.errorId}`
        }
        {...componentProps}
        value={field.state.value}
        onChange={(e) => {
          field.handleChange(e.target.value);
          props.onChange?.(e);
        }}
        onBlur={(e) => {
          field.handleBlur();
          props.onBlur?.(e);
        }}
      />
      <FormFieldError />
    </div>
  );
}
