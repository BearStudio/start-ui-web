import { ElementRef, forwardRef } from 'react';

import {
  FormLabel,
  FormLabelProps,
  RequiredIndicator,
  chakra,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { useFormField } from '@/components/Form/FormField';

export type FormFieldLabelProps = FormLabelProps & {
  optionalityHint?: 'required' | 'optional' | false;
};

export const FormFieldLabel = forwardRef<
  ElementRef<typeof FormLabel>,
  FormFieldLabelProps
>(({ optionalityHint, ...props }, ref) => {
  const { size } = useFormField();
  const { t } = useTranslation(['components']);

  return (
    <FormLabel
      ref={ref}
      m={0}
      requiredIndicator={
        optionalityHint === 'required' ? <RequiredIndicator m={0} /> : null
      }
      display="flex"
      alignItems="baseline"
      gap={1.5}
      optionalIndicator={
        optionalityHint === 'optional' ? (
          <chakra.small
            fontSize="xs"
            textTransform="none"
            fontWeight="normal"
            color="gray.600"
          >
            {t('components:formField.optional')}
          </chakra.small>
        ) : null
      }
      fontSize={props.size ?? size}
      {...props}
    />
  );
});
FormFieldLabel.displayName = 'FormFieldLabel';
