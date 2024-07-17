import { ReactNode, useState } from 'react';

import {
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputProps,
  InputRightElement,
} from '@chakra-ui/react';
import {
  Controller,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import { RiEyeCloseLine, RiEyeLine } from 'react-icons/ri';

import {
  FieldCommonProps,
  useFormFieldContext,
} from '@/components/Form/FormField';
import { FormFieldError } from '@/components/Form/FormFieldError';
import { FormFieldHelper } from '@/components/Form/FormFieldHelper';
import { FormFieldItem } from '@/components/Form/FormFieldItem';
import { FormFieldLabel } from '@/components/Form/FormFieldLabel';

export type FieldPasswordProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'password';
  label?: ReactNode;
  helper?: ReactNode;
  endElement?: ReactNode;
  inputProps?: RemoveFromType<InputProps, ControllerRenderProps>;
} & Pick<InputProps, 'placeholder' | 'size' | 'autoFocus'> &
  FieldCommonProps<TFieldValues, TName>;

export const FieldPassword = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldPasswordProps<TFieldValues, TName>
) => {
  const { isDisabled } = useFormFieldContext();
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Controller
      {...props}
      render={({ field }) => (
        <FormFieldItem>
          {!!props.label && (
            <FormFieldLabel size={props.size}>{props.label}</FormFieldLabel>
          )}
          <InputGroup size={props.size}>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder={props.placeholder}
              autoFocus={props.autoFocus}
              {...props.inputProps}
              {...field}
            />
            <InputLeftElement>
              <IconButton
                isDisabled={isDisabled}
                onClick={() => setShowPassword((x) => !x)}
                aria-label={showPassword ? 'Hide password' : 'Show password'} // TODO: translation
                display="flex"
                size="xs"
                fontSize="lg"
                icon={showPassword ? <RiEyeLine /> : <RiEyeCloseLine />}
                variant="unstyled"
              />
            </InputLeftElement>
            {!!props.endElement && (
              <InputRightElement>{props.endElement}</InputRightElement>
            )}
          </InputGroup>
          {!!props.helper && <FormFieldHelper>{props.helper}</FormFieldHelper>}
          <FormFieldError />
        </FormFieldItem>
      )}
    />
  );
};
