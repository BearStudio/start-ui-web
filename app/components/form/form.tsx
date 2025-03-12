import {
  FieldValues,
  FormProvider,
  FormProviderProps,
  SubmitHandler,
} from 'react-hook-form';

type FormProps<TFieldValues extends FieldValues> = StrictUnion<
  | (FormProviderProps<TFieldValues> & {
      noHtmlForm?: false;
      onSubmit?: SubmitHandler<TFieldValues>;
      formClassName?: string;
    })
  | (FormProviderProps<TFieldValues> & {
      noHtmlForm: true;
    })
>;

export const Form = <TFieldValues extends FieldValues>({
  noHtmlForm = false,
  formClassName,
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
        className={formClassName}
      >
        {props.children}
      </form>
    </FormProvider>
  );
};
