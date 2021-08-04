import React from 'react';

import { Stack, Button } from '@chakra-ui/react';
import { Formiz } from '@formiz/core';

import { FieldInput } from '../FieldInput';
import { FieldSelect } from '../FieldSelect';
import { FieldTextarea } from '../FieldTextarea';
import { FieldRepeater, RepeaterCloseButton } from './index';

export default {
  title: 'Fields/FieldRepeater',
};

export const Default = () => (
  <Formiz onSubmit={console.log} autoForm>
    <Stack spacing={6}>
      <FieldRepeater
        name="demo-repeater"
        label="Username"
        placeholder="Placeholder"
        helper="This is an helper"
        required="Username is required"
      >
        <Stack direction="row" flex={4}>
          <FieldInput name="coordinates" required="L'adresse est requise" />
          <RepeaterCloseButton />
        </Stack>
      </FieldRepeater>
      <Button type="submit">Submit</Button>
    </Stack>
  </Formiz>
);

export const WithCustomButtonAdd = () => (
  <Formiz onSubmit={console.log} autoForm>
    <Stack spacing={6}>
      <FieldRepeater
        name="demo-repeater"
        label="Usernames"
        placeholder="Placeholder"
        helper="This is an helper"
        buttonAdd={<Button>Nouvel élément</Button>}
      >
        <Stack direction="row" flex={4} alignItems="center">
          <FieldInput name="input" required="Field is required" />
          <RepeaterCloseButton />
        </Stack>
      </FieldRepeater>
      <Button type="submit" variant="@secondary">
        Submit
      </Button>
    </Stack>
  </Formiz>
);

export const OtherExample = () => (
  <Formiz onSubmit={console.log} autoForm>
    <Stack spacing={6}>
      <FieldRepeater
        name="demo-repeater"
        label="Usernames"
        placeholder="Placeholder"
        helper="This is an helper"
        buttonAdd={<Button>Nouvel élément</Button>}
      >
        <Stack direction="row" flex={4} alignItems="center">
          <RepeaterCloseButton />
          <FieldSelect
            name="color"
            options={[
              { label: 'Red', value: 'red' },
              { label: 'Yellow', value: 'yellow' },
              { label: 'Blue', value: 'blue' },
            ]}
          />
          <FieldTextarea name="text" required="Text is required" />
        </Stack>
      </FieldRepeater>
      <Button type="submit" variant="@secondary">
        Submit
      </Button>
    </Stack>
  </Formiz>
);
