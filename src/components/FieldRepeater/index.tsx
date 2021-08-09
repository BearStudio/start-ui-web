import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Button, ButtonProps, Stack, Text } from '@chakra-ui/react';
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
}

const [
  RepeaterContextProvider,
  useRepeaterContext,
] = createContext<RepeaterContext>({
  strict: true,
  name: 'RepeaterContext',
  errorMessage:
    'useRepeaterContext: `context` is undefined. Seems you forgot to wrap modal components in `<FieldRepeater />`',
});

interface FieldRepeaterProps extends FieldProps, FormGroupProps {}

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
    <RepeaterContextProvider
      value={{
        name: rest?.name,
        internalValue,
        setInternalValue,
        onAdd: () => insertAtIndex(internalValue?.length),
        onRemove: (_internalId) => handleRemoveItem(_internalId),
        onInsertAtIndex: (index) => insertAtIndex(index),
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
    </RepeaterContextProvider>
  );
};

interface RepeaterItemChildrenProps {
  data: any;
  index: number;
  onRemove: () => void;
  onAddBefore: () => void;
  onAddAfter: () => void;
}

interface RepeaterItemProps extends Omit<FieldProps, 'name'> {
  children(props: RepeaterItemChildrenProps): ReactNode;
}

export const RepeaterItem: React.FC<RepeaterItemProps> = ({ children }) => {
  const {
    name,
    internalValue,
    onRemove,
    onInsertAtIndex,
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
        onRemove: () => onRemove(item?._internalId),
        onAddBefore: () => onInsertAtIndex(index),
        onAddAfter: () => onInsertAtIndex(index + 1),
      })}
    </FieldInternalRepeaterItem>
  ));
};

interface FieldRepeaterAddButtonProps extends Omit<ButtonProps, 'children'> {
  children?: ReactElement;
}

export const FieldRepeaterAddButton: React.FC<FieldRepeaterAddButtonProps> = ({
  children,
  ...rest
}) => {
  const { onAdd } = useRepeaterContext();

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

interface FieldInternalRepeaterItemProps extends FieldProps {}

// This component is a field, which uses a Formiz form to manage its own value.
const FieldInternalRepeaterItem: React.FC<FieldInternalRepeaterItemProps> = ({
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
      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={{ base: 2, xl: 4 }}
        p={4}
      >
        <FieldHidden name="_internalId" />
        {children}
      </Stack>
    </Formiz>
  );
};
