import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react';

import { FormHelperText } from '@chakra-ui/react';

import { useFormFieldContext } from '@/components/Form/FormField';

export const FormFieldHelper = forwardRef<
  ElementRef<typeof FormHelperText>,
  ComponentPropsWithoutRef<typeof FormHelperText>
>(({ ...props }, ref) => {
  const fieldContext = useFormFieldContext();

  const getPaddingTop = () => {
    if (fieldContext.layout !== 'row') return;
    if (fieldContext.size === 'lg') return 4;
    if (fieldContext.size === 'md') return 3;
    if (fieldContext.size === 'sm') return 2;
  };

  return <FormHelperText ref={ref} m={0} pt={getPaddingTop()} {...props} />;
});
FormFieldHelper.displayName = 'FormFieldHelper';
