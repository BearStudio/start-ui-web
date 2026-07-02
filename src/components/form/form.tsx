import { createContext, ReactNode, use } from 'react';

import { cn } from '@/lib/tailwind/utils';

import { FormInstance } from '@/components/form/types';

const FormContext = createContext<FormInstance | null>(null);

export function useFormContext<TFormData = ExplicitAny>() {
  const form = use(FormContext);

  if (!form) {
    throw new Error('useFormContext must be used within a <Form />');
  }

  return form as FormInstance<TFormData>;
}

type FormProps<TFormData> = {
  form: FormInstance<TFormData>;
  children?: ReactNode;
} & StrictUnion<
  | {
      noHtmlForm?: false;
      className?: string;
    }
  | {
      noHtmlForm: true;
    }
>;

export const Form = <TFormData,>({
  form,
  noHtmlForm = false,
  children,
  ...props
}: FormProps<TFormData>) => {
  if (noHtmlForm) {
    return <FormContext value={form}>{children}</FormContext>;
  }

  return (
    <FormContext value={form}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();

          const htmlForm = e.currentTarget;
          form.handleSubmit().then(() => {
            // Focus the first invalid field, like react-hook-form did
            if (!form.state.isValid) {
              htmlForm
                .querySelector<HTMLElement>('[aria-invalid="true"]')
                ?.focus();
            }
          });
        }}
        className={cn(
          'flex flex-1 flex-col',
          'className' in props ? props.className : undefined
        )}
      >
        {children}
      </form>
    </FormContext>
  );
};
