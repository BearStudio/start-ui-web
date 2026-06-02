import { ComponentProps } from 'react';

import { Label } from '@/platform/components/ui/label';

import { useFormField } from './form-field-context';

type FormFieldLabelProps = Omit<ComponentProps<'label'>, 'id' | 'htmlFor'>;

export const FormFieldLabel = (props: FormFieldLabelProps) => {
  const ctx = useFormField();
  return <Label {...props} id={ctx.labelId} htmlFor={ctx.id} />;
};
