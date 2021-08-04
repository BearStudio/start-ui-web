import React from 'react';

import { Stack, Button } from '@chakra-ui/react';
import { Formiz } from '@formiz/core';

import { FieldInput } from '../FieldInput';
import { FieldSelect } from '../FieldSelect';
import { FieldTextarea } from '../FieldTextarea';
import {
  FieldRepeater,
  RepeaterAddButton,
  RepeaterCloseButton,
  RepeaterItem,
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
        <RepeaterItem>
          <Stack direction="row" alignItems="center" p={0}>
            <FieldInput name="username" required="Username is required" />
            <RepeaterCloseButton />
          </Stack>
        </RepeaterItem>
        <RepeaterAddButton />
      </Stack>
    </FieldRepeater>
    <Button type="submit">Submit</Button>
  </Formiz>
);

export const WithCustomButtonAdd = () => (
  <Formiz onSubmit={console.log} autoForm>
    <FieldRepeater
      name="usernames"
      label="Usernames"
      helper="This is an helper"
    >
      <RepeaterItem>
        <Stack direction="row" flex={4} alignItems="center">
          <FieldInput name="input" required="Field is required" />
          <RepeaterCloseButton />
        </Stack>
      </RepeaterItem>
      <RepeaterAddButton>
        <Button>Custom Add Button</Button>
      </RepeaterAddButton>
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
      <RepeaterAddButton />
      <Stack direction="row">
        <RepeaterItem>
          <Stack flex={4} alignItems="center">
            <RepeaterCloseButton />
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
        </RepeaterItem>
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
      <RepeaterItem>
        <Stack direction="row" flex={4} alignItems="center">
          <RepeaterCloseButton />
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
      </RepeaterItem>
      <RepeaterAddButton />
    </FieldRepeater>
    <Button type="submit" variant="@secondary">
      Submit
    </Button>
  </Formiz>
);
