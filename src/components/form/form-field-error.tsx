import { AlertCircleIcon } from 'lucide-react';
import { ComponentProps, ReactNode, use } from 'react';
import {
  ControllerProps,
  FieldError,
  FieldErrors,
  FieldPath,
  FieldValues,
  get,
  useFormState,
} from 'react-hook-form';

import { cn } from '@/lib/tailwind/utils';

import { useFormFieldUnsafe } from '@/components/form/form-field';

import {
  FormFieldControllerContext,
  FormFieldControllerContextValue,
} from './form-field-controller';

type FormFieldErrorProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ComponentProps<'div'>, 'children'> & {
  children?: (params: { error?: FieldError }) => ReactNode;
} & (
    | Required<Pick<ControllerProps<TFieldValues, TName>, 'control' | 'name'>>
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    | {}
  );

export const FormFieldError = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  className,
  children,
  ...props
}: FormFieldErrorProps<TFieldValues, TName>) => {
  const fieldCtx = useFormFieldUnsafe();
  const controllerCtx = use<FormFieldControllerContextValue<
    TFieldValues,
    TName
  > | null>(FormFieldControllerContext as ExplicitAny);
  const { errors } = useFormState<TFieldValues>();
  const control = 'control' in props ? props.control : controllerCtx?.control;
  const name = 'name' in props ? props.name : controllerCtx?.name;

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

  if (controllerCtx?.displayError === false) {
    return null;
  }

  if (children) {
    return children({ error });
  }

  const {
    control: _,

    name: __,
    ...rest
  } = 'control' in props
    ? props
    : { ...props, control: undefined, name: undefined };

  return (
    <div
      id={fieldCtx?.errorId}
      className={cn(
        'flex animate-in gap-1 text-sm text-negative-600 slide-in-from-top-1 dark:text-negative-400',
        className
      )}
      {...rest}
    >
      <AlertCircleIcon size="1em" className="my-0.5 flex-none" />
      {errorMessage}
    </div>
  );
};
