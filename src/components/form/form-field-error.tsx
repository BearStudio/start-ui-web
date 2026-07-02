import { DeepKeys, useStore } from '@tanstack/react-form';
import { AlertCircleIcon } from 'lucide-react';
import { ComponentProps, ReactNode, use } from 'react';

import { cn } from '@/lib/tailwind/utils';

import { useFormFieldUnsafe } from '@/components/form/form-field';
import { FormFieldControllerContext } from '@/components/form/form-field-controller/context';
import { FormInstance } from '@/components/form/types';

export type FieldError = { message?: string };

const getErrorMessage = (error: unknown): string | undefined => {
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && 'message' in error) {
    return typeof error.message === 'string' ? error.message : undefined;
  }
  return undefined;
};

type FormFieldErrorDisplayProps = Omit<ComponentProps<'div'>, 'children'> & {
  children?: (params: { error?: FieldError }) => ReactNode;
};

type FormFieldErrorProps<TFormData = ExplicitAny> = FormFieldErrorDisplayProps &
  (
    | {
        form: FormInstance<TFormData>;
        name: DeepKeys<TFormData>;
      }
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    | {}
  );

export const FormFieldError = <TFormData = ExplicitAny>(
  props: FormFieldErrorProps<TFormData>
) => {
  if ('form' in props && 'name' in props) {
    return <FormFieldErrorStandalone {...props} />;
  }

  return <FormFieldErrorFromController {...props} />;
};

const FormFieldErrorFromController = (props: FormFieldErrorDisplayProps) => {
  const controllerCtx = use(FormFieldControllerContext);

  if (!controllerCtx) {
    throw new Error(
      'Missing <FormFieldController /> parent component or "form" and "name" props on <FormFieldError />'
    );
  }

  if (controllerCtx.displayError === false) {
    return null;
  }

  return (
    <FormFieldErrorDisplay
      errorMessage={getErrorMessage(controllerCtx.fieldState.meta.errors[0])}
      {...props}
    />
  );
};

const FormFieldErrorStandalone = <TFormData,>({
  form,
  name,
  ...props
}: FormFieldErrorDisplayProps & {
  form: FormInstance<TFormData>;
  name: DeepKeys<TFormData>;
}) => {
  const error = useStore(
    form.store,
    (state) => state.fieldMeta[name]?.errors[0]
  );

  return (
    <FormFieldErrorDisplay errorMessage={getErrorMessage(error)} {...props} />
  );
};

const FormFieldErrorDisplay = ({
  errorMessage,
  className,
  children,
  ...rest
}: FormFieldErrorDisplayProps & { errorMessage?: string }) => {
  const fieldCtx = useFormFieldUnsafe();

  if (!errorMessage) {
    return null;
  }

  if (children) {
    return children({ error: { message: errorMessage } });
  }

  return (
    <div
      id={fieldCtx?.errorId}
      className={cn(
        'flex animate-in gap-1 text-sm text-negative-600 slide-in-from-top-1 dark:text-negative-400',
        className
      )}
      role="alert"
      {...rest}
    >
      <AlertCircleIcon size="1em" className="my-0.5 flex-none" />
      {errorMessage}
    </div>
  );
};
