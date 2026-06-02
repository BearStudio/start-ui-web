import { Fragment } from 'react';

import { FormFieldContainer } from '@/platform/components/form/form-field-container';
import { useFormField } from '@/platform/components/form/form-field-context';
import { FormFieldError } from '@/platform/components/form/form-field-error';
import { FieldProps } from '@/platform/components/form/types';
import { useTfField } from '@/platform/components/form/use-tf-field';
import {
  Radio,
  RadioGroup,
  RadioProps,
} from '@/platform/components/ui/radio-group';

type RadioOption = Omit<RadioProps, 'children' | 'render'> & {
  label: string;
};

export const FieldRadioGroup = (
  props: FieldProps<
    {
      options: Array<RadioOption>;
      renderOption?: (props: RadioOption) => React.JSX.Element;
      containerProps?: React.ComponentProps<typeof FormFieldContainer>;
    } & React.ComponentProps<typeof RadioGroup>
  >
) => {
  const { containerProps, options, renderOption, ...rest } = props;
  const ctx = useFormField();
  const { field, fieldState } = useTfField<string>();
  return (
    <FormFieldContainer {...containerProps}>
      <RadioGroup
        {...rest}
        id={ctx.id}
        aria-invalid={fieldState.invalid ? true : undefined}
        aria-labelledby={ctx.labelId}
        aria-describedby={ctx.describedBy(fieldState.invalid)}
        value={field.value ?? ''}
        onValueChange={(value, event) => {
          field.onChange(value);
          rest.onValueChange?.(value, event);
        }}
      >
        {options.map(({ label, ...option }) => {
          const radioId = `${ctx.id}-${option.value}`;

          if (renderOption) {
            return (
              <Fragment key={radioId}>
                {renderOption({
                  label,
                  'aria-invalid': fieldState.invalid,
                  size: ctx.size,
                  onBlur: field.onBlur,
                  ...option,
                })}
              </Fragment>
            );
          }

          return (
            <Radio
              key={radioId}
              aria-invalid={fieldState.invalid ? true : undefined}
              size={ctx.size}
              onBlur={field.onBlur}
              {...option}
            >
              {label}
            </Radio>
          );
        })}
      </RadioGroup>

      <FormFieldError errors={fieldState.errors} />
    </FormFieldContainer>
  );
};
