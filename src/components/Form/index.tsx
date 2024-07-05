import {
  FieldValues,
  FormProvider,
  FormProviderProps,
  SubmitHandler,
} from 'react-hook-form';

export type FormProps<TFieldValues extends FieldValues> = StrictUnion<
  | (FormProviderProps<TFieldValues> & {
      noHtmlForm?: false;
      onSubmit?: SubmitHandler<TFieldValues>;
    })
  | (FormProviderProps<TFieldValues> & {
      noHtmlForm: true;
    })
>;

export const Form = <TFieldValues extends FieldValues>({
  noHtmlForm = false,
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
          }
        }}
      >
        {props.children}
      </form>
    </FormProvider>
  );
};

export { FormField } from './FormField';
export { FormFieldItem } from './FormFieldItem';
export { FormFieldLabel } from './FormFieldLabel';
export { FormFieldHelper } from './FormFieldHelper';
export { FormFieldError } from './FormFieldError';
