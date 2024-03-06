import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react';

import { FormHelperText } from '@chakra-ui/react';

import { useFormField } from '@/components/Form/FormFieldContext';

export const FormFieldHelper = forwardRef<
  ElementRef<typeof FormHelperText>,
  ComponentPropsWithoutRef<typeof FormHelperText>
>(({ ...props }, ref) => {
  const { formHelperId } = useFormField();

  return <FormHelperText ref={ref} id={formHelperId} m={0} {...props} />;
});
FormFieldHelper.displayName = 'FormFieldHelper';
