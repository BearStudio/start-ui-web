import React, { ReactNode, useEffect, useRef, useState } from 'react';

import { createContext } from '@chakra-ui/react-utils';
import { FieldProps, Formiz, useField, useForm } from '@formiz/core';
import { v4 as uuid } from 'uuid';

import { FieldHidden } from '@/components';
import { FormGroup, FormGroupProps } from '@/components/FormGroup';

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
    'useRepeaterContext: `context` is undefined. Seems you forgot to wrap modal components in `<FieldRepeater />`',
});

interface FieldRepeaterChildrenProps {
  add(index?: number): void;
  remove(index?: number): void;
  collection: any[];
}

interface FieldRepeaterProps extends FieldProps, FormGroupProps {
  children(props: FieldRepeaterChildrenProps): ReactNode;
}

export const FieldRepeater: React.FC<FieldRepeaterProps> = ({
  children,
  required,
  ...rest
}) => {
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
    defaultValue: [],
    ...rest,
    validations: [
      {
        rule: () => internalForm.isValid,
        message: 'At least one element is invalid',
        deps: [internalForm.isValid],
      },
      ...(rest.validations || []),
    ],
  });
  const { label, helper } = otherProps;

  const [internalValue, setInternalValue] = useState(
    value?.map((v) => ({ ...v, key: uuid() }))
  );

  const setValueRef = useRef(setValue);
  setValueRef.current = setValue;

  useEffect(() => {
    setValueRef.current(removeInternalIds(internalValue));
  }, [internalValue]);

  const removeInternalIds = (value) => {
    return value?.map((v) => {
      const { key, ...valueRest } = v;
      return valueRest;
    });
  };

  const add = (index: number = internalValue?.length): void => {
    setInternalValue([
      ...internalValue.slice(0, index),
      { key: uuid() },
      ...internalValue.slice(index),
    ]);
  };

  const remove = (index: number = internalValue?.length): void => {
    setInternalValue(internalValue.filter((_, i) => index !== i));
  };

  const showError = !isValid && isSubmitted;

  const formGroupProps = {
    errorMessage,
    helper,
    id,
    isRequired: !!required,
    label,
    showError,
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
      <FormGroup {...formGroupProps}>
        <Formiz
          connect={internalForm}
          initialValues={{
            [rest.name]: internalValue,
          }}
          onChange={(value) => {
            setInternalValue(value?.[rest.name] ?? []);
          }}
        >
          {children({ add, remove, collection: internalValue })}
        </Formiz>
      </FormGroup>
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
      fields: ['key'],
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
      <FieldHidden name="key" />
      {children}
    </Formiz>
  );
};
