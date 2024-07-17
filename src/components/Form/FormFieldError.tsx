import { ElementRef, ReactNode } from 'react';

import { Flex, FlexProps, SlideFade } from '@chakra-ui/react';
import {
  ControllerProps,
  FieldError,
  FieldPath,
  FieldValues,
  useFormContext,
} from 'react-hook-form';
import { LuAlertCircle } from 'react-icons/lu';

import { Icon } from '@/components/Icons';
import { fixedForwardRef } from '@/lib/utils';

type FormFieldErrorProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<FlexProps, 'children'> &
  Required<Pick<ControllerProps<TFieldValues, TName>, 'control' | 'name'>> & {
    displayError?: boolean;
    children?: (params: { error?: FieldError }) => ReactNode;
  };

const FormFieldErrorComponent = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  {
    name,
    control,
    displayError,
    children,
    ...props
  }: FormFieldErrorProps<TFieldValues, TName>,
  ref: ElementRef<typeof Flex>
) => {
  const { formState } = useFormContext<TFieldValues, TName>();
  const { error } = control.getFieldState(name, formState);

  if (!error) {
    return null;
  }

  if (displayError === false) {
    return null;
  }

  if (children) {
    return children({ error });
  }

  return (
    <SlideFade in offsetY={-6}>
      <Flex fontSize="sm" color="error.500" ref={ref} {...props}>
        <Icon icon={LuAlertCircle} me="2" />
        {!!error?.message && <span>{error.message}</span>}
      </Flex>
    </SlideFade>
  );
};

FormFieldErrorComponent.displayName = 'FormFieldError';
export const FormFieldError = fixedForwardRef(FormFieldErrorComponent);
