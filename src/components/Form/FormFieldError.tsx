import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react';

import { FormErrorMessage, FormHelperText, SlideFade } from '@chakra-ui/react';
import { LuAlertCircle } from 'react-icons/lu';

import { Icon } from '@/components/Icons';

import { useFormField } from './FormFieldContext';

export const FormFieldError = forwardRef<
  ElementRef<typeof FormErrorMessage>,
  ComponentPropsWithoutRef<typeof FormErrorMessage>
>(({ children, ...props }, ref) => {
  const { error, formErrorId } = useFormField();

  if (!error && !children) {
    return null;
  }

  if (!error) {
    return <FormHelperText m={0}>{children}</FormHelperText>;
  }

  return (
    <FormErrorMessage m={0} ref={ref} id={formErrorId} {...props}>
      <SlideFade in offsetY={-6}>
        <Icon icon={LuAlertCircle} me="2" />
        {String(error?.message)}
      </SlideFade>
    </FormErrorMessage>
  );
});
FormFieldError.displayName = 'FormFieldError';
