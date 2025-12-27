import {
  FieldValues,
  FormProvider,
  FormProviderProps,
  SubmitHandler,
} from 'react-hook-form';

import { cn } from '@/lib/tailwind/utils';

type FormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = ExplicitAny,
  TTransformedValues = TFieldValues,
> = StrictUnion<
  | (FormProviderProps<TFieldValues, TContext, TTransformedValues> & {
      noHtmlForm?: false;
      onSubmit?: SubmitHandler<TTransformedValues>;
      className?: string;
    })
  | (FormProviderProps<TFieldValues, TContext, TTransformedValues> & {
      noHtmlForm: true;
    })
>;

export const Form = <TFieldValues extends FieldValues>({
  noHtmlForm = false,
  className,
  ...props
}: FormProps<TFieldValues>) => {
  if (noHtmlForm) {
    return <FormProvider {...props} />;
  }

  return (
    <FormProvider {...props}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();

          if (props.onSubmit) {
            props.handleSubmit(props.onSubmit)(e);
          } else {
            console.warn('Missing onSubmit method on <Form>');
          }
        }}
        className={cn('flex flex-1 flex-col', className)}
      >
        {props.children}
      </form>
    </FormProvider>
  );
};
