import { ChangeEvent, ReactNode } from 'react';

import { Icon, Spinner, chakra } from '@chakra-ui/react';
import { Input, InputProps } from '@chakra-ui/react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';
import { FiPaperclip } from 'react-icons/fi';

import { FieldCommonProps } from '@/components/Form/FormField';
import { FormFieldError } from '@/components/Form/FormFieldError';
import { FormFieldHelper } from '@/components/Form/FormFieldHelper';
import { FormFieldItem } from '@/components/Form/FormFieldItem';
import { FormFieldLabel } from '@/components/Form/FormFieldLabel';

export type FieldUploadProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'upload';
  label?: ReactNode;
  helper?: ReactNode;
  inputText?: string;
  isLoading?: boolean;
} & Pick<InputProps, 'placeholder' | 'size' | 'autoFocus'> &
  FieldCommonProps<TFieldValues, TName>;

export const FieldUpload = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldUploadProps<TFieldValues, TName>
) => {
  return (
    <Controller
      {...props}
      render={({ field }) => {
        const { value, onChange, ...fieldProps } = field;

        const handleChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
          const file = target.files?.[0];
          console.log('file', { file });

          if (!file) {
            onChange(null);
            return;
          }

          onChange({
            name: file.name,
            size: file.size.toString(),
            type: file.type,
            lastModified: file.lastModified,
            lastModifiedDate: new Date(file.lastModified),
            file,
          });

          console.log('value', { value: field.value });
        };

        const isFieldUploadDisabled = props.isDisabled || props.isLoading;

        console.log(value);
        return (
          <FormFieldItem>
            {!!props.label && <FormFieldLabel>{props.label}</FormFieldLabel>}
            <Input
              as="label"
              position="relative"
              display="flex"
              alignItems="center"
              transition="0.2s"
              isDisabled={isFieldUploadDisabled}
            >
              <chakra.input
                opacity={0}
                position="absolute"
                top={0}
                left={0}
                width={0}
                onChange={handleChange}
                type="file"
                disabled={isFieldUploadDisabled}
                {...fieldProps}
              />
              {props.isLoading ? (
                <Spinner mr="2" size="sm" />
              ) : (
                <Icon as={FiPaperclip} mr="2" />
              )}
              {!props.isLoading && (!value ? props.inputText : value.name)}
            </Input>
            {!!props.helper && (
              <FormFieldHelper>{props.helper}</FormFieldHelper>
            )}
            <FormFieldError />
          </FormFieldItem>
        );
      }}
    />
  );
};
