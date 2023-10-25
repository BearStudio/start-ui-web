import { ChangeEvent } from 'react';

import { Icon, Input, InputProps, Spinner, chakra } from '@chakra-ui/react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';
import { FiPaperclip } from 'react-icons/fi';

import { FieldCommonProps } from '@/components/Form/FormFieldController';
import { FormFieldError } from '@/components/Form/FormFieldError';

type InputRootProps = Pick<InputProps, 'placeholder' | 'size' | 'autoFocus'>;

export type FieldUploadProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'upload';
  inputText?: string;
  isLoading?: boolean;
} & InputRootProps &
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
        };

        const isFieldUploadDisabled = props.isDisabled || props.isLoading;

        return (
          <>
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

            <FormFieldError />
          </>
        );
      }}
    />
  );
};
