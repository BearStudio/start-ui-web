import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react';

import { FormLabel } from '@chakra-ui/react';

import { useFormField } from './FormFieldContext';

export const FormFieldLabel = forwardRef<
  ElementRef<typeof FormLabel>,
  ComponentPropsWithoutRef<typeof FormLabel>
>(({ ...props }, ref) => {
  const { formItemId } = useFormField();

  return <FormLabel ref={ref} htmlFor={formItemId} m={0} {...props} />;
});
FormFieldLabel.displayName = 'FormFieldLabel';
