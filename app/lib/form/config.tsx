import { createFormHook } from '@tanstack/react-form';
import { lazy } from 'react';

import { fieldContext, formContext } from '@/lib/form/context';

import { FormField, FormFieldLabel } from '@/components/form';

const FieldText = lazy(() => import('@/components/form/field-text'));

export const Form = (
  props: React.PropsWithChildren<{
    className?: string;
    form: { handleSubmit(): Promise<void> };
  }>
) => {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await props.form.handleSubmit();
      }}
      noValidate
      className={props.className}
    >
      {props.children}
    </form>
  );
};

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    FieldText,
    FormFieldLabel,
    FormField,
  },
  formComponents: {},
  fieldContext,
  formContext,
});
