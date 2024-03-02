import React, { ChangeEvent } from 'react';

import { Icon, Input, Spinner, chakra } from '@chakra-ui/react';
import { FieldProps, useField } from '@formiz/core';
import { FiPaperclip } from 'react-icons/fi';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';

export type FieldUploadValue = {
  fileUrl?: string;
  file?: File;
  lastModified?: number;
  lastModifiedDate?: Date;
  name?: string;
  size?: string;
  type?: string;
};

export type FieldUploadProps<FormattedValue = FieldUploadValue> = FieldProps<
  FieldUploadValue,
  FormattedValue
> &
  FormGroupProps & {
    inputText?: string;
    isLoading?: boolean;
  };

export const FieldUpload = <FormattedValue = FieldUploadValue,>(
  props: FieldUploadProps<FormattedValue>
) => {
  const {
    errorMessage,
    id,
    isRequired,
    setValue,
    shouldDisplayError,
    value,
    otherProps: {
      children,
      label,
      helper,
      inputText,
      isDisabled,
      isLoading,
      ...rest
    },
  } = useField(props);

  const formGroupProps = {
    errorMessage,
    helper,
    id,
    isRequired,
    label,
    showError: shouldDisplayError,
    ...rest,
  };

  const handleChange = async ({ target }: ChangeEvent<HTMLInputElement>) => {
    const file = target.files?.[0];

    if (!file) {
      setValue(null);
      return;
    }

    setValue({
      name: file.name,
      size: file.size.toString(),
      type: file.type,
      lastModified: file.lastModified,
      lastModifiedDate: new Date(file.lastModified),
      file,
    });
  };

  const isFieldUploadDisabled = isLoading || isDisabled;

  return (
    <FormGroup {...formGroupProps}>
      <Input
        as="label"
        position="relative"
        display="flex"
        alignItems="center"
        isInvalid={shouldDisplayError}
        transition="0.2s"
        isDisabled={isFieldUploadDisabled}
      >
        <chakra.input
          opacity={0}
          position="absolute"
          top={0}
          left={0}
          width={0}
          type="file"
          id={id}
          onChange={handleChange}
          disabled={isFieldUploadDisabled}
        />
        {isLoading ? (
          <Spinner mr="2" size="sm" />
        ) : (
          <Icon as={FiPaperclip} mr="2" />
        )}
        {!isLoading && (!value ? inputText : value.name)}
      </Input>

      {children}
    </FormGroup>
  );
};
