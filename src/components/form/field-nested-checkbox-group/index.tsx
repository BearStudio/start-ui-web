import { Fragment } from 'react';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';

import { useFormField } from '@/components/form/form-field';
import { FormFieldContainer } from '@/components/form/form-field-container';
import { useFormFieldController } from '@/components/form/form-field-controller/context';
import { FormFieldError } from '@/components/form/form-field-error';
import { FieldProps } from '@/components/form/types';
import {
  NestedCheckbox,
  NestedCheckboxProps,
} from '@/components/ui/nested-checkbox-group/nested-checkbox';
import { NestedCheckboxGroup } from '@/components/ui/nested-checkbox-group/nested-checkbox-group';

export type NestedCheckboxOption = Omit<
  NestedCheckboxProps,
  'children' | 'value' | 'render'
> & {
  label: string;
  value: string;
  children?: Array<NestedCheckboxOption>;
};

export const FieldNestedCheckboxGroup = (
  props: FieldProps<
    {
      options: Array<NestedCheckboxOption>;
      containerProps?: React.ComponentProps<typeof FormFieldContainer>;
    } & React.ComponentProps<typeof NestedCheckboxGroup>
  >
) => {
  const { containerProps, options, ...rest } = props;
  const ctx = useFormField();
  const {
    field: { value, onChange, onBlur: _onBlur, ...field },
    fieldState,
  } = useFormFieldController();

  return (
    <FormFieldContainer {...containerProps}>
      <NestedCheckboxGroup
        id={ctx.id}
        aria-invalid={fieldState.invalid ? true : undefined}
        aria-labelledby={ctx.labelId}
        aria-describedby={ctx.describedBy(fieldState.invalid)}
        value={value}
        {...rest}
        onValueChange={(value) => {
          rest.onValueChange?.(value);
          onChange(value);
        }}
      >
        {renderOptions(options, {
          'aria-invalid': fieldState.invalid ? true : undefined,
          size: ctx.size,
          ...field,
        })}
      </NestedCheckboxGroup>
      <FormFieldError />
    </FormFieldContainer>
  );
};

function renderOptions(
  options: NestedCheckboxOption[],
  commonProps: Omit<
    NestedCheckboxProps & ControllerRenderProps<FieldValues>,
    'value' | 'onChange' | 'onBlur'
  >,
  parent?: string
) {
  const Comp = parent ? 'div' : Fragment;
  const compProps = parent
    ? {
        className: 'flex flex-col gap-2 pl-4',
      }
    : {};
  return (
    <Comp {...compProps}>
      {options.map(({ children, label, ...option }) => (
        <Fragment key={option.value}>
          <NestedCheckbox parent={parent} {...option} {...commonProps}>
            {label}
          </NestedCheckbox>
          {children &&
            children.length > 0 &&
            renderOptions(children, commonProps, option.value)}
        </Fragment>
      ))}
    </Comp>
  );
}
