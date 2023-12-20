import React, { ChangeEvent } from 'react';

import { Icon, Input, chakra } from '@chakra-ui/react';
import { FieldProps, useField } from '@formiz/core';
import { FiPaperclip } from 'react-icons/fi';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';

export type FieldUploadValue = {
  name: string;
  size?: number;
  type?: string;
  lastModified?: number;
  lastModifiedDate?: Date;
  file: File;
};

export type FieldUploadProps<FormattedValue = FieldUploadValue> = FieldProps<
  FieldUploadValue,
  FormattedValue
> &
  FormGroupProps;

export const FieldUpload = <FormattedValue = FieldUploadValue,>(
  props: FieldUploadProps<FormattedValue>
) => {
  const {
    errorMessage,
    id,
    isRequired,
    setValue,
    value,
    shouldDisplayError,
    otherProps: { children, label, helper, ...rest },
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

  const handleChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    const file = target.files?.[0];

    if (!file) {
      setValue(null);
      return;
    }

    setValue({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      lastModifiedDate: new Date(file.lastModified),
      file,
    });
  };

  return (
    <FormGroup {...formGroupProps}>
      <Input
        as="label"
        position="relative"
        display="flex"
        alignItems="center"
        isInvalid={shouldDisplayError}
        transition="0.2s"
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
        />
        <Icon as={FiPaperclip} mr="2" />{' '}
        {
          value?.name || 'Select file' // TODO translations
        }
      </Input>
      {children}
    </FormGroup>
  );
};
