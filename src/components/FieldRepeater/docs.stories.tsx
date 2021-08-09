import React from 'react';

import { Stack, Button, IconButton } from '@chakra-ui/react';
import { Formiz } from '@formiz/core';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

import { FieldInput, FieldSelect, FieldTextarea } from '@/components';

import {
  FieldRepeater,
  FieldRepeaterAddButton,
  FieldRepeaterItem,
} from './index';

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
      <Stack>
        <FieldRepeaterItem>
          {({ removeProps }) => (
            <Stack direction="row" alignItems="center" p={0}>
              <FieldInput name="username" required="Username is required" />
              <IconButton
                variant="@primary"
                size="sm"
                aria-label="Supprimer"
                icon={<FiTrash2 />}
                {...removeProps}
              />
            </Stack>
          )}
        </FieldRepeaterItem>
        <FieldRepeaterAddButton />
      </Stack>
    </FieldRepeater>
    <Button type="submit">Submit</Button>
  </Formiz>
);

export const WithMinLength = () => (
  <Formiz onSubmit={console.log} autoForm>
    <FieldRepeater
      name="usernamesMinLength"
      label="Usernames"
      helper="This is an helper"
      required="Username is required"
      minLength={2}
    >
      <Stack>
        <FieldRepeaterItem>
          {({ removeProps }) => (
            <Stack direction="row" alignItems="center" p={0}>
              <FieldInput name="username" required="Username is required" />
              <IconButton
                variant="@primary"
                size="sm"
                aria-label="Supprimer"
                icon={<FiTrash2 />}
                {...removeProps}
              />
            </Stack>
          )}
        </FieldRepeaterItem>
        <FieldRepeaterAddButton />
      </Stack>
    </FieldRepeater>
    <Button type="submit">Submit</Button>
  </Formiz>
);

export const WithMaxLength = () => (
  <Formiz onSubmit={console.log} autoForm>
    <FieldRepeater
      name="usernames"
      label="Usernames"
      helper="This is an helper"
      required="Username is required"
      maxLength={2}
    >
      <Stack>
        <FieldRepeaterItem>
          {({ removeProps }) => (
            <Stack direction="row" alignItems="center" p={0}>
              <FieldInput name="username" required="Username is required" />
              <IconButton
                variant="@primary"
                size="sm"
                aria-label="Supprimer"
                icon={<FiTrash2 />}
                {...removeProps}
              />
            </Stack>
          )}
        </FieldRepeaterItem>
        <FieldRepeaterAddButton />
      </Stack>
    </FieldRepeater>
    <Button type="submit">Submit</Button>
  </Formiz>
);

export const OtherExample = () => (
  <Formiz onSubmit={console.log} autoForm>
    <FieldRepeater
      name="colorText"
      label="Usernames"
      helper="This is an helper"
    >
      <FieldRepeaterAddButton />
      <Stack direction="row">
        <FieldRepeaterItem>
          {({ index, removeProps, onAddBefore, onAddAfter }) => (
            <Stack direction="row">
              <IconButton
                aria-label="Add before"
                icon={<FiPlus />}
                onClick={onAddBefore}
                size="sm"
              />
              <Stack flex={4} alignItems="center">
                <Button
                  variant="@primary"
                  size="sm"
                  aria-label="Supprimer"
                  leftIcon={<FiTrash2 />}
                  {...removeProps}
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
                onClick={onAddAfter}
                size="sm"
              />
            </Stack>
          )}
        </FieldRepeaterItem>
      </Stack>
    </FieldRepeater>
    <Button type="submit" variant="@secondary">
      Submit
    </Button>
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
      <FieldRepeaterItem>
        {({ removeProps }) => (
          <Stack direction="row" flex={4} alignItems="center">
            <IconButton
              variant="@primary"
              size="sm"
              aria-label="Supprimer"
              icon={<FiTrash2 />}
              {...removeProps}
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
        )}
      </FieldRepeaterItem>
      <FieldRepeaterAddButton />
    </FieldRepeater>
    <Button type="submit" variant="@secondary">
      Submit
    </Button>
  </Formiz>
);
