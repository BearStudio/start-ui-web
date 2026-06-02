import type { ComponentProps } from 'react';

import { FormFieldContainer } from '@/platform/components/form/form-field-container';
import { useFormField } from '@/platform/components/form/form-field-context';
import { FormFieldError } from '@/platform/components/form/form-field-error';
import type { FieldProps } from '@/platform/components/form/types';
import { useTfField } from '@/platform/components/form/use-tf-field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/platform/components/ui/select';

type Item = {
  label: string;
  value: ExplicitAny;
  disabled?: boolean;
};

export const FieldSelect = <TItem extends Item>(
  props: FieldProps<
    {
      containerProps?: ComponentProps<typeof FormFieldContainer>;
      inputProps?: ComponentProps<typeof SelectValue>;
    } & Omit<ComponentProps<typeof Select>, 'items'> & {
        items: TItem[];
      } & Pick<ComponentProps<typeof SelectValue>, 'placeholder'>
  >
) => {
  const { containerProps, inputProps, children, placeholder, ...rest } = props;

  const ctx = useFormField();
  const { field, fieldState } = useTfField<TItem['value']>();

  return (
    <FormFieldContainer {...containerProps}>
      <Select
        {...rest}
        disabled={rest.disabled}
        value={field.value ?? null}
        onValueChange={(value, event) => {
          field.onChange(value);
          rest.onValueChange?.(value, event);
        }}
      >
        <SelectTrigger
          aria-invalid={fieldState.invalid ? true : undefined}
          aria-describedby={ctx.describedBy(fieldState.invalid)}
          id={ctx.id}
          onBlur={field.onBlur}
        >
          <SelectValue {...inputProps} placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {children ?? (
            <SelectGroup>
              {rest.items.map((item) => (
                <SelectItem
                  value={item.value}
                  key={item.value}
                  disabled={item.disabled}
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
      <FormFieldError errors={fieldState.errors} />
    </FormFieldContainer>
  );
};
