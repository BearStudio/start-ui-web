import { ComponentProps } from 'react';

import { Label } from '@/components/ui/label';

import { useFormField } from './form-field';

type FormFieldLabelProps = ComponentProps<'label'>;

export const FormFieldLabel = (props: FormFieldLabelProps) => {
  const ctx = useFormField();
  return <Label id={ctx.labelId} htmlFor={ctx.id} {...props} />;
};
