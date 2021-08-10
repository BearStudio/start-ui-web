import React from 'react';

import { Stack, Button, IconButton, Flex, ButtonGroup } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { FiTrash2 } from 'react-icons/fi';

import { FieldInput, FieldSelect } from '@/components';

import { FieldRepeater, FieldRepeaterItem } from './index';

export default {
  title: 'Fields/FieldRepeater',
};

export const Default = () => {
  const form = useForm();
  return (
    <Formiz onSubmit={console.log} autoForm connect={form}>
      <FieldRepeater
        name="usernames"
        label="Usernames"
        helper="This is an helper"
        required="Usernames are required"
      >
        {({ add, remove, collection }) => (
          <Stack spacing="4">
            {collection?.map(({ key }, index: number) => (
              <FieldRepeaterItem key={key} index={index}>
                <Stack direction="row" alignItems="flex-start">
                  <FieldInput name="username" required="Username is required" />
                  <IconButton
                    aria-label="Delete"
                    icon={<FiTrash2 />}
                    onClick={() => remove(index)}
                  />
                </Stack>
              </FieldRepeaterItem>
            ))}
            <Flex justifyContent="space-between">
              <Button variant="@primary" onClick={() => add()}>
                Add
              </Button>
              <Button type="submit">Submit</Button>
            </Flex>
          </Stack>
        )}
      </FieldRepeater>
    </Formiz>
  );
};

export const AddWithData = () => {
  const form = useForm();
  return (
    <Formiz onSubmit={console.log} autoForm connect={form}>
      <FieldRepeater
        name="usernames"
        label="Usernames"
        helper="This is an helper"
        required="Usernames are required"
      >
        {({ add, remove, collection }) => (
          <Stack spacing="4">
            {collection?.map(({ key }, index: number) => (
              <FieldRepeaterItem key={key} index={index}>
                <Stack direction="row" alignItems="flex-start">
                  <FieldInput name="username" required="Username is required" />
                  <IconButton
                    aria-label="Delete"
                    icon={<FiTrash2 />}
                    onClick={() => remove(index)}
                  />
                </Stack>
              </FieldRepeaterItem>
            ))}
            <Flex justifyContent="space-between">
              <Button
                variant="@primary"
                onClick={() => add(undefined, { username: 'Julie' })}
              >
                Add Julie
              </Button>
              <Button type="submit">Submit</Button>
            </Flex>
          </Stack>
        )}
      </FieldRepeater>
    </Formiz>
  );
};

export const WithDefaultValue = () => (
  <Formiz onSubmit={console.log} autoForm>
    <FieldRepeater
      name="usernames"
      label="Usernames"
      helper="This is an helper"
      required="Username is required"
      defaultValue={[
        { username: 'first default' },
        { username: 'second default' },
      ]}
    >
      {({ add, remove, collection }) => (
        <Stack>
          {collection?.map(({ key }, index: number) => (
            <FieldRepeaterItem key={key} index={index}>
              <Stack direction="row" alignItems="center" p={0}>
                <FieldInput name="username" required="Username is required" />
                <IconButton
                  variant="@primary"
                  size="sm"
                  aria-label="Supprimer"
                  icon={<FiTrash2 />}
                  onClick={() => remove(index)}
                />
              </Stack>
            </FieldRepeaterItem>
          ))}
          <Flex justifyContent="space-between">
            <Button variant="@primary" onClick={() => add()}>
              Add
            </Button>
            <Button type="submit">Submit</Button>
          </Flex>
        </Stack>
      )}
    </FieldRepeater>
  </Formiz>
);

export const WithInitialValues = () => (
  <Formiz
    onSubmit={console.log}
    autoForm
    initialValues={{
      colorText: [{ color: 'red', text: 'Julie' }, { color: 'blue' }],
    }}
  >
    <FieldRepeater
      name="colorText"
      label="Usernames"
      helper="This is an helper"
    >
      {({ add, remove, collection }) => (
        <Stack>
          {collection?.map(({ key }, index: number) => (
            <FieldRepeaterItem key={key} index={index}>
              <Stack direction="row" flex={4} alignItems="center">
                <IconButton
                  variant="@primary"
                  size="sm"
                  aria-label="Supprimer"
                  icon={<FiTrash2 />}
                  onClick={() => remove(index)}
                />
                <FieldSelect
                  name="color"
                  options={[
                    { label: 'Red', value: 'red' },
                    { label: 'Yellow', value: 'yellow' },
                    { label: 'Blue', value: 'blue' },
                  ]}
                  required="Color is required"
                />
                <FieldInput name="text" />
              </Stack>
            </FieldRepeaterItem>
          ))}
          <Flex justifyContent="space-between">
            <Button variant="@primary" onClick={() => add()}>
              Add
            </Button>
            <Button type="submit">Submit</Button>
          </Flex>
        </Stack>
      )}
    </FieldRepeater>
  </Formiz>
);

export const SetFieldsValues = () => {
  const form = useForm();
  return (
    <Formiz onSubmit={console.log} autoForm connect={form}>
      <FieldRepeater
        name="usernames"
        label="Usernames"
        helper="This is an helper"
        required="Usernames are required"
      >
        {({ add, remove, collection }) => (
          <Stack spacing="4">
            {collection?.map(({ key }, index: number) => (
              <FieldRepeaterItem key={key} index={index}>
                <Stack direction="row" alignItems="flex-start">
                  <FieldInput name="username" required="Username is required" />
                  <IconButton
                    aria-label="Delete"
                    icon={<FiTrash2 />}
                    onClick={() => remove(index)}
                  />
                </Stack>
              </FieldRepeaterItem>
            ))}
            <Flex justifyContent="space-between">
              <ButtonGroup>
                <Button variant="@primary" onClick={() => add()}>
                  Add
                </Button>
                <Button
                  onClick={() =>
                    form.setFieldsValues({
                      usernames: [{ username: 'Lea' }, { username: 'Luke' }],
                    })
                  }
                >
                  Set Fields Values
                </Button>
                <Button
                  onClick={() =>
                    form.setFieldsValues({
                      usernames: null,
                    })
                  }
                >
                  Clear
                </Button>
              </ButtonGroup>
              <Button type="submit">Submit</Button>
            </Flex>
          </Stack>
        )}
      </FieldRepeater>
    </Formiz>
  );
};
