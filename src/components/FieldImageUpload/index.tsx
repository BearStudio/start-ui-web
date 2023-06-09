import React, { FC, useEffect, useState } from 'react';

import { InputGroup } from '@chakra-ui/react';
import { FieldProps, useField } from '@formiz/core';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';
import { ImageUpload, ImageUploadProps } from '@/components/ImageUpload';

export type FieldImageUploadProps = FieldProps &
  Omit<FormGroupProps, 'placeholder'> & {
    imageUploadProps?: Omit<ImageUploadProps, 'value' | 'onChange'>;
  };

export const FieldImageUpload: FC<FieldImageUploadProps> = (props) => {
  const {
    errorMessage,
    id,
    isValid,
    isSubmitted,
    resetKey,
    setValue,
    value,
    otherProps,
  } = useField(props);

  const { children, label, helper, color, imageUploadProps, ...rest } =
    otherProps;
  const { required } = props;
  const [isTouched, setIsTouched] = useState(false);
  const showError = !isValid && (isTouched || isSubmitted);

  useEffect(() => {
    setIsTouched(false);
  }, [resetKey]);

  const formGroupProps = {
    errorMessage,
    helper,
    id,
    isRequired: !!required,
    label,
    showError,
    ...rest,
  };

  return (
    <FormGroup {...formGroupProps}>
      <InputGroup>
        <ImageUpload
          flex="1"
          id={id}
          value={value ?? ''}
          onChange={(e) => setValue(e)}
          onBlur={() => setIsTouched(true)}
          bgColor={color}
          {...imageUploadProps}
        />
      </InputGroup>
      {children}
    </FormGroup>
  );
};
