import { ElementRef, ReactNode, useContext } from 'react';

import { Flex, FlexProps, SlideFade } from '@chakra-ui/react';
import {
  ControllerProps,
  FieldError,
  FieldErrors,
  FieldPath,
  FieldValues,
  get,
  useFormContext,
} from 'react-hook-form';
import { LuAlertCircle } from 'react-icons/lu';

import {
  FormFieldControllerContext,
  FormFieldControllerContextValue,
} from '@/components/Form/FormFieldController';
import { Icon } from '@/components/Icons';
import { fixedForwardRef } from '@/lib/utils';

type FormFieldErrorProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<FlexProps, 'children'> & {
  children?: (params: { error?: FieldError }) => ReactNode;
} & (
    | Required<Pick<ControllerProps<TFieldValues, TName>, 'control' | 'name'>>
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    | {}
  );

const FormFieldErrorComponent = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  { children, ...props }: FormFieldErrorProps<TFieldValues, TName>,
  ref: ElementRef<typeof Flex>
) => {
  const ctx = useContext<FormFieldControllerContextValue<
    TFieldValues,
    TName
  > | null>(FormFieldControllerContext as ExplicitAny);
  const {
    formState: { errors },
  } = useFormContext<TFieldValues, TName>();
  const control = 'control' in props ? props.control : ctx?.control;
  const name = 'name' in props ? props.name : ctx?.name;

  if (!control || !name) {
    throw new Error(
      'Missing <FormFieldController /> parent component or "control" and "name" props on <FormFieldError />'
    );
  }

  const error = get<FieldErrors<TFieldValues>>(errors, name);
  const errorMessage = error?.root?.message ?? error?.message;

  if (!errorMessage) {
    return null;
  }

  if (ctx?.displayError === false) {
    return null;
  }

  if (children) {
    return children({ error });
  }

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    control: _,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    name: __,
    ...rest
  } = 'control' in props
    ? props
    : { ...props, control: undefined, name: undefined };

  return (
    <SlideFade in offsetY={-6}>
      <Flex fontSize="sm" color="error.500" ref={ref} {...rest}>
        <Icon icon={LuAlertCircle} me="2" />
        <span>{errorMessage}</span>
      </Flex>
    </SlideFade>
  );
};

FormFieldErrorComponent.displayName = 'FormFieldError';
export const FormFieldError = fixedForwardRef(FormFieldErrorComponent);
