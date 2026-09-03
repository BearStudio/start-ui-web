import { Fragment } from 'react';

import { useFormField } from '@/components/form/form-field';
import { FormFieldContainer } from '@/components/form/form-field-container';
import { useFormFieldController } from '@/components/form/form-field-controller/context';
import { FormFieldError } from '@/components/form/form-field-error';
import { FieldProps } from '@/components/form/types';
import { Radio, RadioGroup, RadioProps } from '@/components/ui/radio-group';

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
  const { field, fieldState, isInvalid } = useFormFieldController();
  return (
    <FormFieldContainer {...containerProps}>
      <RadioGroup
        id={ctx.id}
        aria-invalid={isInvalid ? true : undefined}
        aria-labelledby={ctx.labelId}
        aria-describedby={ctx.describedBy(isInvalid)}
        {...rest}
        name={field.name}
        value={fieldState.value}
        onValueChange={(value, eventDetails) => {
          field.handleChange(value);
          rest.onValueChange?.(value, eventDetails);
        }}
        onBlur={(e) => {
          field.handleBlur();
          rest.onBlur?.(e);
        }}
      >
        {options.map(({ label, ...option }) => {
          const radioId = `${ctx.id}-${option.value}`;

          if (renderOption) {
            return (
              <Fragment key={radioId}>
                {renderOption({
                  label,
                  'aria-invalid': isInvalid,
                  size: ctx.size,
                  ...option,
                })}
              </Fragment>
            );
          }

          return (
            <Radio
              key={radioId}
              aria-invalid={isInvalid ? true : undefined}
              size={ctx.size}
              {...option}
            >
              {label}
            </Radio>
          );
        })}
      </RadioGroup>

      <FormFieldError />
    </FormFieldContainer>
  );
};
