import { useStore } from '@tanstack/react-form';
import { ComponentProps } from 'react';

import { useFieldContext } from '@/lib/form/context';
import { cn } from '@/lib/tailwind/utils';

import { FormFieldError } from '@/components/form';
import { Select } from '@/components/ui/select';

export default function FieldSelect(
  props: ComponentProps<typeof Select> & {
    containerProps?: ComponentProps<'div'>;
  }
) {
  const field = useFieldContext<string | null | undefined>();

  const meta = useStore(field.store, (state) => ({
    id: state.meta.id,
    descriptionId: state.meta.descriptionId,
    errorId: state.meta.errorId,
    error: state.meta.errors[0],
  }));

  const { containerProps, ...rest } = props;

  return (
    <div
      {...containerProps}
      className={cn('flex flex-1 flex-col gap-1', containerProps?.className)}
    >
      <Select
        ids={{ input: meta.id }}
        invalid={meta.error ? true : undefined}
        aria-invalid={meta.error ? true : undefined}
        aria-describedby={
          !meta.error
            ? meta.descriptionId
            : `${meta.descriptionId} ${meta.errorId}`
        }
        {...rest}
        value={rest.options.find((option) => option.id === field.value) ?? null}
        onChange={(e) => {
          field.handleChange(e ? e.id : null);
          rest.onChange?.(e);
        }}
        inputProps={{
          id: meta.id,
          onBlur: (e) => {
            field.handleBlur();
            rest.inputProps?.onBlur?.(e);
          },
          ...rest.inputProps,
        }}
      />
      <FormFieldError />
    </div>
  );
}
