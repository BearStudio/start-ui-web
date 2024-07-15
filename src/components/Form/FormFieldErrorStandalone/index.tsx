import { ElementRef, ReactNode } from 'react';

import { Flex, FlexProps, SlideFade } from '@chakra-ui/react';
import {
  ControllerProps,
  FieldError,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import { LuAlertCircle } from 'react-icons/lu';

import { Icon } from '@/components/Icons';
import { fixedForwardRef } from '@/lib/utils';

type FormFieldErrorStandaloneProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = StrictUnion<
  | (Omit<FlexProps, 'children'> &
      Required<Pick<ControllerProps<TFieldValues, TName>, 'control' | 'name'>>)
  | (Required<
      Pick<ControllerProps<TFieldValues, TName>, 'control' | 'name'>
    > & {
      children: (params: { error?: FieldError }) => ReactNode;
    })
>;

const FormFieldErrorStandaloneComponent = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  {
    name,
    control,
    children,
    ...props
  }: FormFieldErrorStandaloneProps<TFieldValues, TName>,
  ref: ElementRef<typeof Flex>
) => {
  const { error } = control.getFieldState(name);

  if (!error) {
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

FormFieldErrorStandaloneComponent.displayName = 'FormFieldErrorStandalone';
export const FormFieldErrorStandalone = fixedForwardRef(
  FormFieldErrorStandaloneComponent
);
