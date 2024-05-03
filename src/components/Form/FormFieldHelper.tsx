import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react';

import { FormHelperText } from '@chakra-ui/react';

export const FormFieldHelper = forwardRef<
  ElementRef<typeof FormHelperText>,
  ComponentPropsWithoutRef<typeof FormHelperText>
>(({ ...props }, ref) => {
  return <FormHelperText ref={ref} m={0} {...props} />;
});
FormFieldHelper.displayName = 'FormFieldHelper';
