import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react';

import { Slot } from '@radix-ui/react-slot';

import { useFormField } from './FormField';

export const FormFieldControl = forwardRef<
  ElementRef<typeof Slot>,
  ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formHelperId, formErrorId } = useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error ? `${formHelperId}` : `${formHelperId} ${formErrorId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormFieldControl.displayName = 'FormFieldControl';
