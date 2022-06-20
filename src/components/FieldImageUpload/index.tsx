import React, { useEffect, useState } from 'react';

import { InputGroup } from '@chakra-ui/react';
import { FieldProps, useField } from '@formiz/core';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';
import { ImageUpload, ImageUploadProps } from '@/components/ImageUpload';

export interface FieldImageUploadProps
  extends FieldProps,
    Omit<FormGroupProps, 'placeholder'> {
  imageUploadProps?: Omit<ImageUploadProps, 'value' | 'onChange'>;
}

export const FieldImageUpload = (props: FieldImageUploadProps) => {
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
  const {
    children,
    label,
    type,
    placeholder,
    helper,
    leftIcon,
    rightIcon,
    color,
    imageUploadProps,
    ...rest
  } = otherProps;
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
