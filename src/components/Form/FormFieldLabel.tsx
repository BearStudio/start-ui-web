import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react';

import { FormLabel, RequiredIndicator, chakra } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { useFormField } from './FormField';

export type FormFieldLabelProps = ComponentPropsWithoutRef<typeof FormLabel>;

export const FormFieldLabel = forwardRef<
  ElementRef<typeof FormLabel>,
  ComponentPropsWithoutRef<typeof FormLabel>
>((props, ref) => {
  const { optionalityHint } = useFormField();
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
      fontSize={props.size}
      {...props}
    />
  );
});
FormFieldLabel.displayName = 'FormFieldLabel';
