import React, { ReactElement, useEffect, useRef, useState } from 'react';

import {
  Center,
  Text,
  Button,
  Divider,
  Stack,
  IconButton,
} from '@chakra-ui/react';
import { createContext } from '@chakra-ui/react-utils';
import { FieldProps, Formiz, useField, useForm } from '@formiz/core';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { v4 as uuid } from 'uuid';

import { FieldHidden } from '@/components';

import { FormGroup, FormGroupProps } from '../FormGroup';

interface ItemFormValues {
  _internalId: string;
}

interface FieldInternalProps extends FieldProps {
  onRemove?: (internalId: string) => void;
}

// This component is a field, which uses a Formiz form to manage its own value.
const FieldInternal: React.FC<FieldInternalProps> = ({
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
        message: "L'élément n'est pas valide",
        deps: [internalForm.isValid],
      },
      ...(props?.validations || []),
    ],
  });

  const handleChange = (values) => {
    setValue(values);
  };

  return (
    <RepeaterContextProvider
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
    </RepeaterContextProvider>
  );
};

interface FieldRepeaterProps extends FieldProps, FormGroupProps {
  buttonAdd?: ReactElement;
}

// This component is a field, which uses a Formiz form to manage its own value.
// This component adapts the repeater pattern to manage a variable amount of the
// same field.
export const FieldRepeater: React.FC<FieldRepeaterProps> = ({
  children,
  buttonAdd = (
    <Button bg="white" _hover={{ bg: false }} role="group" fontWeight="medium">
      <Center color="brand.600">
        <FiPlus />
        <Text
          fontSize="sm"
          ml="1"
          textDecoration="underline"
          _groupHover={{ textDecoration: 'none' }}
        >
          Ajouter un élément
        </Text>
      </Center>
    </Button>
  ),
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
        message: "Au moins un élément n'est pas valide",
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

  const handleCreateItem = (): void => {
    setInternalValue([...internalValue, { _internalId: uuid() }]);
  };

  const handleRemoveItem = (internalId: string): void => {
    setInternalValue(
      internalValue.filter(
        (item: ItemFormValues) => item._internalId !== internalId
      )
    );
  };

  const ButtonAdd = () =>
    React.cloneElement(buttonAdd, {
      onClick: handleCreateItem,
    });

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
        <Stack
          layerStyle="formBox"
          padding={0}
          spacing={0}
          divider={<Divider />}
        >
          {internalValue?.map((item, index: number) => (
            <FieldInternal
              key={item._internalId}
              name={`${rest.name}[${index}]`}
              defaultValue={item}
              onRemove={handleRemoveItem}
            >
              {children}
            </FieldInternal>
          ))}
          <ButtonAdd />
        </Stack>
      </Formiz>
    </FormGroup>
  );
};

export const RepeaterCloseButton = (props) => {
  const { onClick, ...rest } = props;
  const { onRemove } = useRepeaterContext();

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
      {...rest}
    />
  );
};

interface RepeaterContext {
  onRemove(): void;
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
