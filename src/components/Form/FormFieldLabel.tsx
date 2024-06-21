import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react';

import { FormLabel, RequiredIndicator, chakra } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { useFormField } from './FormField';

export type FormFieldLabelProps = ComponentPropsWithoutRef<typeof FormLabel>;

export const FormFieldLabel = forwardRef<
  ElementRef<typeof FormLabel>,
  ComponentPropsWithoutRef<typeof FormLabel>
>((props, ref) => {
  const fieldContext = useFormField();
  const { t } = useTranslation(['components']);

  const getPaddingTop = () => {
    if (fieldContext.layout !== 'row') return;
    if (fieldContext.size === 'lg') return 2.5;
    if (fieldContext.size === 'md') return 2;
    if (fieldContext.size === 'sm') return 1.5;
  };

  return (
    <FormLabel
      ref={ref}
      m={0}
      requiredIndicator={
        fieldContext.optionalityHint === 'required' ? (
          <RequiredIndicator m={0} />
        ) : null
      }
      display="flex"
      alignItems="baseline"
      gap={1.5}
      optionalIndicator={
        fieldContext.optionalityHint === 'optional' ? (
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
      fontSize={props.size ?? fieldContext.size}
      pt={getPaddingTop()}
      flex={fieldContext.layout === 'row' ? 'none' : undefined}
      size={props.size ?? fieldContext.size}
      w={fieldContext.layout === 'row' ? fieldContext.rowLabelWidth : undefined}
      {...props}
    />
  );
});
FormFieldLabel.displayName = 'FormFieldLabel';
