import React, { ReactNode, useEffect, useRef, useState } from 'react';

import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  SlideFade,
} from '@chakra-ui/react';
import { createContext } from '@chakra-ui/react-utils';
import { FieldProps, Formiz, useField, useForm } from '@formiz/core';
import { FiAlertCircle } from 'react-icons/fi';
import { v4 as uuid } from 'uuid';

import { FieldHidden, Icon } from '@/components';

interface RepeaterContext {
  name: string;
  internalValue: any;
  setInternalValue(internalValue: any): void;
}

const [
  FieldRepeaterContextProvider,
  useRepeaterContext,
] = createContext<RepeaterContext>({
  strict: true,
  name: 'RepeaterContext',
  errorMessage:
    'useRepeaterContext: `context` is undefined. Seems you forgot to wrap components in `<FieldRepeater />`',
});

interface FieldRepeaterChildrenProps {
  add(index?: number, data?: any): void;
  remove(index?: number): void;
  collection: any[];
  isValid: boolean;
}

interface FieldRepeaterProps extends FieldProps {
  children(props: FieldRepeaterChildrenProps): ReactNode;
  helper?: ReactNode;
  label?: ReactNode;
  invalidMessage?: string;
}

export const FieldRepeater: React.FC<FieldRepeaterProps> = (props) => {
  const { invalidMessage, ...fieldProps } = props;
  const { children, required, ...rest } = fieldProps;
  const externalForm = useForm({ subscribe: { form: true } });

  // Destructure the submit to use it in the dependency array.
  const { submit: internalFormSubmit, ...internalForm } = useForm({
    subscribe: {
      form: true,
    },
  });

  // Submit the internalForm when the extenalForm is submitted
  useEffect(() => {
    if (externalForm.isSubmitted) {
      internalFormSubmit();
    }
  }, [internalFormSubmit, externalForm.isSubmitted]);

  const {
    value,
    setValue,
    errorMessage,
    id,
    isValid,
    isSubmitted,
    otherProps,
  } = useField({
    ...fieldProps,
    validations: [
      {
        rule: () => internalForm.isValid,
        message: props?.invalidMessage || 'At least one element is invalid',
        deps: [internalForm.isValid],
      },
      ...(props?.validations || []),
    ],
  });

  const { label, helper } = otherProps;

  const [internalValue, setInternalValue] = useState(
    value?.map((v) => ({ ...v, __repeaterKey: uuid() }))
  );

  const valueRef = useRef(value);
  valueRef.current = value;

  const setValueRef = useRef(setValue);
  setValueRef.current = setValue;

  const internalValueRef = useRef(internalValue);
  internalValueRef.current = internalValue;

  const removeInternalIds = (values: any[]) =>
    values?.map(({ __repeaterKey, ...valueRest }) => valueRest);

  useEffect(() => {
    if (
      value !== undefined &&
      JSON.stringify(value) !==
        JSON.stringify(removeInternalIds(internalValueRef.current))
    ) {
      setInternalValue(value?.map((v) => ({ ...v, __repeaterKey: uuid() })));
    }
  }, [value]);

  useEffect(() => {
    if (
      internalValue !== undefined &&
      JSON.stringify(valueRef.current) !==
        JSON.stringify(removeInternalIds(internalValue))
    ) {
      setValueRef.current(removeInternalIds(internalValue));
    }
  }, [internalValue]);

  const add = (index: number, data = {}): void => {
    if (index === undefined || index === null) {
      index = internalValue?.length;
    }
    setInternalValue([
      ...(internalValue || []).slice(0, index ?? internalValue?.length),
      { ...data, __repeaterKey: uuid() },
      ...(internalValue || []).slice(index),
    ]);
  };

  const remove = (index: number): void => {
    if (index === undefined || index === null) {
      index = internalValue?.length;
    }
    const filteredInternalValue = (internalValue || []).filter(
      (_, i) => index !== i
    );
    setInternalValue(
      filteredInternalValue?.length > 0 ? filteredInternalValue : null
    );
  };

  const showError = !isValid && isSubmitted;

  const formGroupProps = {
    id,
    isRequired: !!required,
    isInvalid: showError,
    ...otherProps,
  };

  return (
    <FieldRepeaterContextProvider
      value={{
        name: rest?.name,
        internalValue,
        setInternalValue,
      }}
    >
      <FormControl {...formGroupProps}>
        {!!label && <FormLabel htmlFor={id}>{label}</FormLabel>}
        {!!helper && (
          <FormHelperText mt="-2" mb="2">
            {helper}
          </FormHelperText>
        )}
        <FormErrorMessage id={`${id}-error`} mt="0" mb="4">
          <SlideFade in offsetY={-6}>
            <Icon icon={FiAlertCircle} me="2" />
            {errorMessage}
          </SlideFade>
        </FormErrorMessage>

        <Formiz
          connect={internalForm}
          initialValues={{
            [rest.name]: internalValue,
          }}
          onChange={(values) => {
            setInternalValue(values?.[rest.name] ?? null);
          }}
        >
          {children({
            isValid: !!internalForm?.isValid,
            add,
            remove,
            collection: internalValue?.map(({ __repeaterKey, ...data }) => ({
              key: __repeaterKey,
              data,
            })),
          })}
        </Formiz>
      </FormControl>
    </FieldRepeaterContextProvider>
  );
};

interface FieldRepeaterItemProps extends Omit<FieldProps, 'name'> {
  index: number;
}

// This component is a field, which uses a Formiz form to manage its own value.
export const FieldRepeaterItem: React.FC<FieldRepeaterItemProps> = ({
  children,
  index,
  ...props
}) => {
  const externalForm = useForm({ subscribe: { form: true } });

  // Destructure the submit to use it in the dependency array.
  const { submit: internalFormSubmit, ...internalForm } = useForm({
    subscribe: {
      form: true,
      fields: ['__repeaterKey'],
    },
  });

  // Submit the internalForm when the extenalForm is submitted
  useEffect(() => {
    if (externalForm.isSubmitted) {
      internalFormSubmit();
    }
  }, [internalFormSubmit, externalForm.isSubmitted]);

  const { name, internalValue } = useRepeaterContext();

  const { value, setValue } = useField({
    defaultValue: internalValue[index],
    ...props,
    validations: [
      {
        rule: () => internalForm.isValid,
        message: 'Element is invalid',
        deps: [internalForm.isValid],
      },
      ...(props?.validations || []),
    ],
    name: `${name}[${index}]`,
  });

  const handleChange = (values) => {
    setValue(values);
  };

  return (
    <Formiz
      connect={internalForm}
      onChange={handleChange}
      initialValues={value}
    >
      <FieldHidden name="__repeaterKey" />
      {children}
    </Formiz>
  );
};
