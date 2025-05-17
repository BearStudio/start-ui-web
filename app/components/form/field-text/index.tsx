import { useStore } from '@tanstack/react-form';
import { ComponentProps } from 'react';

import { useFieldContext } from '@/lib/form/context';
import { cn } from '@/lib/tailwind/utils';

import { FormFieldError } from '@/components/form';
import { FieldContextMeta } from '@/components/form/form-field';
import { Input, InputProps } from '@/components/ui/input';

export default function FieldText(
  props: InputProps & { containerProps?: ComponentProps<'div'> }
) {
  const field = useFieldContext<string>();

  const meta = useStore(field.store, (state) => {
    const fieldMeta = state.meta as FieldContextMeta;
    return {
      id: fieldMeta.id,
      descriptionId: fieldMeta.descriptionId,
      errorId: fieldMeta.errorId,
      error: fieldMeta.errors[0],
    };
  });

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
