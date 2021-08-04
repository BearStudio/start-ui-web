import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Text,
  Button,
  Stack,
  IconButton,
  ButtonProps,
  IconButtonProps,
} from '@chakra-ui/react';
import { createContext } from '@chakra-ui/react-utils';
import { FieldProps, Formiz, useField, useForm } from '@formiz/core';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { v4 as uuid } from 'uuid';

import { FieldHidden } from '@/components';

import { FormGroup, FormGroupProps } from '../FormGroup';

interface RepeaterContext {
  name: string;
  internalValue: any;
  setInternalValue(internalValue: any): void;
  onAdd(): void;
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

interface RepeaterItemContext {
  onRemove(): void;
}

const [
  RepeaterItemContextProvider,
  useRepeaterItemContext,
] = createContext<RepeaterItemContext>({
  strict: true,
  name: 'RepeaterItemContext',
  errorMessage:
    'useRepeaterItemContext: `context` is undefined. Seems you forgot to wrap modal components in `<FieldRepeater />`',
});

interface ItemFormValues {
  _internalId: string;
}

interface FieldRepeaterItemProps extends FieldProps {
  onRemove?: (internalId: string) => void;
}

// This component is a field, which uses a Formiz form to manage its own value.
const FieldRepeaterItem: React.FC<FieldRepeaterItemProps> = ({
  children,
  onRemove = () => {},
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
    <RepeaterItemContextProvider
      value={{ onRemove: () => onRemove(value?._internalId) }}
    >
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
    </RepeaterItemContextProvider>
  );
};

interface FieldRepeaterProps extends FieldProps, FormGroupProps {}

// This component is a field, which uses a Formiz form to manage its own value.
// This component adapts the repeater pattern to manage a variable amount of the
// same field.
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

  const handleAddItem = (): void => {
    setInternalValue([...internalValue, { _internalId: uuid() }]);
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
        onAdd: () => handleAddItem(),
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

interface RepeaterItemProps {
  children: ReactNode;
}

export const RepeaterItem: React.FC<RepeaterItemProps> = ({ children }) => {
  const { name, internalValue, setInternalValue } = useRepeaterContext();

  const handleRemoveItem = (internalId: string): void => {
    setInternalValue(
      internalValue.filter(
        (item: ItemFormValues) => item._internalId !== internalId
      )
    );
  };

  return internalValue?.map((item, index: number) => (
    <FieldRepeaterItem
      key={item._internalId}
      name={`${name}[${index}]`}
      defaultValue={item}
      onRemove={handleRemoveItem}
    >
      {children}
    </FieldRepeaterItem>
  ));
};

interface RepeaterCloseButtonProps extends Partial<IconButtonProps> {}

export const RepeaterCloseButton: React.FC<RepeaterCloseButtonProps> = (
  props
) => {
  const { onRemove } = useRepeaterItemContext();

  return (
    <IconButton
      variant="@primary"
      size="sm"
      aria-label="Supprimer"
      icon={<FiTrash2 />}
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      {...props}
    />
  );
};

interface RepeaterAddButtonProps extends Omit<ButtonProps, 'children'> {
  children?: ReactElement;
}

export const RepeaterAddButton: React.FC<RepeaterAddButtonProps> = ({
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
        <FiPlus />
        <Text
          fontSize="sm"
          ml="1"
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
