import React, { useState } from 'react';

import { Button, Divider, Flex, Stack } from '@chakra-ui/react';
import { Formiz } from '@formiz/core';

import {
  FieldCheckboxes,
  FieldCheckboxesCheckAll,
  FieldCheckboxesItem,
} from '.';

export default {
  title: 'Fields/FieldCheckboxes',
};

export const Default = () => {
  const options = [
    { label: 'Red', value: 'red' },
    { label: 'Green', value: 'green' },
    { label: 'Blue', value: 'blue' },
  ];

  return (
    <Formiz onChange={console.log} autoForm>
      <FieldCheckboxes
        name="colors"
        label="Colors"
        required="You need to check at least one color"
        options={options}
      />
      <Button type="submit">Submit</Button>
    </Formiz>
  );
};

export const IsDisabled = () => {
  const options = [{ value: 'Red' }, { value: 'Green' }, { value: 'Blue' }];

  return (
    <Formiz>
      <FieldCheckboxes
        name="colors"
        label="Colors"
        isDisabled
        options={options}
      />
    </Formiz>
  );
};

export const WithDefaultValues = () => {
  const options = [
    { label: 'Red', value: 'red' },
    { label: 'Green', value: 'green' },
    { label: 'Blue', value: 'blue' },
  ];

  return (
    <Formiz onChange={console.log}>
      <FieldCheckboxes
        name="colors"
        label="Colors"
        defaultValue={['red']}
        options={options}
      />
    </Formiz>
  );
};

export const WithCustomRender = () => {
  return (
    <Formiz onChange={console.log}>
      <FieldCheckboxes
        name="colors"
        label="Colors"
        required="You need to check at least one color"
      >
        <Stack>
          <FieldCheckboxesCheckAll>All colors</FieldCheckboxesCheckAll>
          <Divider />
          <FieldCheckboxesItem value="red" defaultChecked>
            Red
          </FieldCheckboxesItem>
          <FieldCheckboxesItem value="green">Green</FieldCheckboxesItem>
          <FieldCheckboxesItem value="blue">Blue</FieldCheckboxesItem>
        </Stack>
      </FieldCheckboxes>
    </Formiz>
  );
};

export const WithItemKey = () => {
  const options = [
    { id: 1, color: 'Red' },
    { id: 2, color: 'Green' },
    { id: 3, color: 'Blue' },
  ];

  return (
    <Formiz onChange={console.log}>
      <FieldCheckboxes itemKey="id" name="colors" label="Colors">
        <Stack>
          <FieldCheckboxesCheckAll>All colors</FieldCheckboxesCheckAll>
          <Divider />
          {options.map((value) => (
            <FieldCheckboxesItem key={value.id} value={value}>
              {value.color}
            </FieldCheckboxesItem>
          ))}
        </Stack>
      </FieldCheckboxes>
    </Formiz>
  );
};

export const MountingFields = () => {
  const [isMounted, setIsMounted] = useState<boolean>(true);

  return (
    <Formiz onChange={console.log}>
      <FieldCheckboxes name="colors">
        <Stack>
          <FieldCheckboxesCheckAll>All</FieldCheckboxesCheckAll>
          {isMounted && (
            <>
              <FieldCheckboxesItem value={1}>Orange</FieldCheckboxesItem>
              <FieldCheckboxesItem value={2}>Purple</FieldCheckboxesItem>
              <FieldCheckboxesItem value={3}>Green</FieldCheckboxesItem>
            </>
          )}
        </Stack>
      </FieldCheckboxes>
      <Button mt={2} onClick={() => setIsMounted(!isMounted)}>
        Toggle Checkboxes
      </Button>
    </Formiz>
  );
};

export const WithNestedCheckboxGroup = () => {
  return (
    <Formiz onChange={console.log}>
      <FieldCheckboxes name="numbers" label="Numbers" colorScheme="brand">
        <Flex direction="column">
          <FieldCheckboxesCheckAll groups="main">
            All numbers
          </FieldCheckboxesCheckAll>
          <Flex direction="column" pl={2}>
            <FieldCheckboxesItem groups="main" value={1}>
              1
            </FieldCheckboxesItem>
            <FieldCheckboxesItem groups="main" value={2}>
              2
            </FieldCheckboxesItem>
            <FieldCheckboxesItem groups="main" value={3}>
              3
            </FieldCheckboxesItem>
            <FieldCheckboxesCheckAll groups="sub">4</FieldCheckboxesCheckAll>
            <Flex direction="column" pl={2}>
              <FieldCheckboxesItem groups={['sub', 'main']} value={4.1}>
                4.1
              </FieldCheckboxesItem>
              <FieldCheckboxesItem groups={['sub', 'main']} value={4.2}>
                4.2
              </FieldCheckboxesItem>
              <FieldCheckboxesItem groups={['sub', 'main']} value={4.3}>
                4.3
              </FieldCheckboxesItem>
            </Flex>
          </Flex>
        </Flex>
      </FieldCheckboxes>
    </Formiz>
  );
};

export const LargeTest = () => {
  const options = Array.from({ length: 100 }).map((_, index) => ({
    value: index + 1,
  }));

  return (
    <Formiz onChange={console.log}>
      <FieldCheckboxes name="colors" label="Colors">
        <Stack>
          <FieldCheckboxesCheckAll>All</FieldCheckboxesCheckAll>
          <Divider />
          {options.map(({ value }) => (
            <FieldCheckboxesItem key={value} value={value}>
              {value}
            </FieldCheckboxesItem>
          ))}
        </Stack>
      </FieldCheckboxes>
    </Formiz>
  );
};
