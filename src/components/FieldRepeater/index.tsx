import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Button, ButtonProps, Text } from '@chakra-ui/react';
import { createContext } from '@chakra-ui/react-utils';
import { FieldProps, Formiz, useField, useForm } from '@formiz/core';
import { FiPlus } from 'react-icons/fi';
import { v4 as uuid } from 'uuid';

import { FieldHidden, Icon } from '@/components';
import { FormGroup, FormGroupProps } from '@/components/FormGroup';

interface RepeaterContext {
  name: string;
  internalValue: any;
  setInternalValue(internalValue: any): void;
  onAdd(): void;
  onRemove(_internalId: string): void;
  onInsertAtIndex(index: number): void;
  minLength: number;
  maxLength: number;
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

interface FieldRepeaterProps extends FieldProps, FormGroupProps {
  minLength?: number;
  maxLength?: number;
}

export const FieldRepeater: React.FC<FieldRepeaterProps> = ({
  children,
  required,
  minLength = 0,
  maxLength,
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
    defaultValue: minLength ? [minLength, null] : [],
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
    value?.map((v) => ({ ...v, _internalId: uuid() }))
  );

  const setValueRef = useRef(setValue);
  setValueRef.current = setValue;

  useEffect(() => {
    setValueRef.current(removeInternalIds(internalValue));
  }, [internalValue]);

  const removeInternalIds = (value) => {
    return value?.map((v) => {
      const { _internalId, ...valueRest } = v;
      return valueRest;
    });
  };

  const insertAtIndex = (index) =>
    setInternalValue([
      ...internalValue.slice(0, index),
      { _internalId: uuid() },
      ...internalValue.slice(index),
    ]);

  const handleRemoveItem = (internalId: string): void => {
    setInternalValue(
      internalValue.filter((item) => item._internalId !== internalId)
    );
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
        onAdd: () => insertAtIndex(internalValue?.length),
        onRemove: (_internalId) => handleRemoveItem(_internalId),
        onInsertAtIndex: (index) => insertAtIndex(index),
        minLength,
        maxLength,
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
          {children}
        </Formiz>
      </FormGroup>
    </FieldRepeaterContextProvider>
  );
};

interface FieldRepeaterItemRemoveProps {
  onClick(): void;
  isDisabled: boolean;
}

interface FieldRepeaterItemChildrenProps {
  data: any;
  index: number;
  removeProps: FieldRepeaterItemRemoveProps;
  onAddBefore: () => void;
  onAddAfter: () => void;
}

interface FieldRepeaterItemProps extends Omit<FieldProps, 'name'> {
  children(props: FieldRepeaterItemChildrenProps): ReactNode;
}

export const FieldRepeaterItem: React.FC<FieldRepeaterItemProps> = ({
  children,
}) => {
  const {
    name,
    internalValue,
    onRemove,
    onInsertAtIndex,
    minLength,
  } = useRepeaterContext();

  return internalValue?.map((item, index: number) => (
    <FieldInternalRepeaterItem
      key={item._internalId}
      name={`${name}[${index}]`}
      defaultValue={item}
    >
      {children({
        data: item,
        index,
        removeProps: {
          onClick: () => onRemove(item?._internalId),
          isDisabled: internalValue?.length <= minLength,
        },
        onAddBefore: () => onInsertAtIndex(index),
        onAddAfter: () => onInsertAtIndex(index + 1),
      })}
    </FieldInternalRepeaterItem>
  ));
};

// This component is a field, which uses a Formiz form to manage its own value.
const FieldInternalRepeaterItem: React.FC<FieldProps> = ({
  children,
  ...props
}) => {
  const externalForm = useForm({ subscribe: { form: true } });

  // Destructure the submit to use it in the dependency array.
  const { submit: internalFormSubmit, ...internalForm } = useForm({
    subscribe: {
      form: true,
      fields: ['_internalId'],
    },
  });

  // Submit the internalForm when the extenalForm is submitted
  useEffect(() => {
    if (externalForm.isSubmitted) {
      internalFormSubmit();
    }
  }, [internalFormSubmit, externalForm.isSubmitted]);

  const { value, setValue } = useField({
    ...props,
    validations: [
      {
        rule: () => internalForm.isValid,
        message: 'Element is invalid',
        deps: [internalForm.isValid],
      },
      ...(props?.validations || []),
    ],
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
      <FieldHidden name="_internalId" />
      {children}
    </Formiz>
  );
};

interface FieldRepeaterAddButtonProps extends Omit<ButtonProps, 'children'> {
  children?: ReactElement;
}

export const FieldRepeaterAddButton: React.FC<FieldRepeaterAddButtonProps> = ({
  children,
  ...rest
}) => {
  const { onAdd, internalValue, maxLength } = useRepeaterContext();

  if (internalValue?.length >= maxLength) {
    return null;
  }

  if (!children) {
    return (
      <Button
        variant="@primary"
        onClick={(e) => {
          e.stopPropagation();
          onAdd();
        }}
        {...rest}
      >
        <Icon icon={FiPlus} mr="1" />
        <Text
          fontSize="sm"
          textDecoration="underline"
          _groupHover={{ textDecoration: 'none' }}
        >
          Add an element
        </Text>
      </Button>
    );
  }

  const AddButton = () =>
    React.cloneElement(children, {
      onClick: onAdd,
    });

  return <AddButton />;
};
