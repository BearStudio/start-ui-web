import type { ComponentProps } from 'react';

import { useFormField } from '@/components/form/form-field';
import { FormFieldContainer } from '@/components/form/form-field-container';
import { useFormFieldController } from '@/components/form/form-field-controller/context';
import { FormFieldError } from '@/components/form/form-field-error';
import type { FieldProps } from '@/components/form/types';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const { field, fieldState } = useFormFieldController();

  return (
    <FormFieldContainer {...containerProps}>
      <Select
        {...rest}
        inputRef={field.ref}
        disabled={field.disabled}
        value={field.value ?? null}
        onValueChange={(value, event) => {
          field.onChange(value, event);
          rest.onValueChange?.(value, event);
        }}
      >
        <SelectTrigger
          aria-invalid={fieldState.invalid ? true : undefined}
          aria-describedby={ctx.describedBy(fieldState.invalid)}
          id={ctx.id}
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
      <FormFieldError />
    </FormFieldContainer>
  );
};
