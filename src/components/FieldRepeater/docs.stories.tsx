import React from 'react';

import { Stack, Button, IconButton } from '@chakra-ui/react';
import { Formiz } from '@formiz/core';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

import { FieldInput, FieldSelect, FieldTextarea } from '@/components';

import { FieldRepeater, FieldRepeaterItem } from './index';

export default {
  title: 'Fields/FieldRepeater',
};

export const Default = () => (
  <Formiz onSubmit={console.log} autoForm>
    <FieldRepeater
      name="usernames"
      label="Usernames"
      helper="This is an helper"
      required="Username is required"
    >
      {({ add, remove, collection }) => (
        <Stack>
          {collection?.map((item, index: number) => (
            <FieldRepeaterItem key={item?.key} index={index}>
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
          <Button onClick={() => add()}>Add</Button>
        </Stack>
      )}
    </FieldRepeater>
    <Button type="submit">Submit</Button>
  </Formiz>
);

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
          {collection?.map((item, index: number) => (
            <FieldRepeaterItem key={item?.key} index={index}>
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
          <Button onClick={() => add()}>Add</Button>
        </Stack>
      )}
    </FieldRepeater>
    <Button type="submit">Submit</Button>
  </Formiz>
);

export const WithInitialValues = () => (
  <Formiz
    onSubmit={console.log}
    autoForm
    initialValues={{
      colorText: [{ color: 'red', text: 'fsojfiqjfs' }, { color: 'blue' }],
    }}
  >
    <FieldRepeater
      name="colorText"
      label="Usernames"
      helper="This is an helper"
    >
      {({ add, remove, collection }) => (
        <Stack>
          {collection?.map((item, index: number) => (
            <>
              <FieldRepeaterItem key={item?.key} index={index}>
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
                  <FieldTextarea name="text" />
                </Stack>
              </FieldRepeaterItem>
            </>
          ))}
          <Button onClick={() => add()}>Add an element</Button>
        </Stack>
      )}
    </FieldRepeater>
    <Button type="submit" variant="@secondary">
      Submit
    </Button>
  </Formiz>
);

export const OtherExample = () => (
  <Formiz onSubmit={console.log} autoForm>
    <FieldRepeater
      name="colorText"
      label="Usernames"
      helper="This is an helper"
    >
      {({ add, remove, collection }) => (
        <Stack>
          <Button onClick={() => add()}>Add an element</Button>
          <Stack direction="row">
            {collection?.map((item, index: number) => (
              <FieldRepeaterItem key={item?.key} index={index}>
                <Stack direction="row">
                  <IconButton
                    aria-label="Add before"
                    icon={<FiPlus />}
                    onClick={() => add(index)}
                    size="sm"
                  />
                  <Stack flex={4} alignItems="center">
                    <Button
                      variant="@primary"
                      size="sm"
                      aria-label="Supprimer"
                      leftIcon={<FiTrash2 />}
                      onClick={() => remove(index)}
                    >
                      Delete {index}
                    </Button>
                    <FieldSelect
                      name="color"
                      options={[
                        { label: 'Red', value: 'red' },
                        { label: 'Yellow', value: 'yellow' },
                        { label: 'Blue', value: 'blue' },
                      ]}
                      required="Color is required"
                    />
                    <FieldTextarea name="text" />
                  </Stack>

                  <IconButton
                    aria-label="Add before"
                    icon={<FiPlus />}
                    onClick={() => add(index + 1)}
                    size="sm"
                  />
                </Stack>
              </FieldRepeaterItem>
            ))}
          </Stack>
        </Stack>
      )}
    </FieldRepeater>
    <Button type="submit" variant="@secondary">
      Submit
    </Button>
  </Formiz>
);
