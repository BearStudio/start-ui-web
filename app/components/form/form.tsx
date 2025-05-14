import { AnyFormApi } from '@tanstack/react-form';

import { formContext as FormContext } from '@/lib/form/context';
import { cn } from '@/lib/tailwind/utils';

export const Form = (
  props: React.PropsWithChildren<{
    form: AnyFormApi;
    className?: string;
  }>
) => {
  return (
    <FormContext value={props.form}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await props.form.handleSubmit();
        }}
        noValidate
        className={cn('flex flex-1 flex-col', props.className)}
      >
        {props.children}
      </form>
    </FormContext>
  );
};
