import { Fragment } from 'react';

import { FormFieldError } from '@/components/form';
import { useFormField } from '@/components/form/form-field';
import { FormFieldContainer } from '@/components/form/form-field-container';
import { useFormFieldController } from '@/components/form/form-field-controller/context';
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
  const {
    field: { value, onChange, ...field },
    fieldState,
  } = useFormFieldController();
  return (
    <FormFieldContainer {...containerProps}>
      <RadioGroup
        id={ctx.id}
        aria-invalid={fieldState.invalid ? true : undefined}
        aria-labelledby={ctx.labelId}
        aria-describedby={ctx.describedBy(fieldState.invalid)}
        value={value}
        onValueChange={onChange}
        {...rest}
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
                  ...field,
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
              {...field}
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
