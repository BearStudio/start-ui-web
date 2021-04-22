import React from 'react';

import { Box, Stack } from '@chakra-ui/react';

import { Select } from '.';

export default {
  title: 'components/Select',
};

const decorators = [
  (Story) => (
    <Box h="24rem">
      <Story />
    </Box>
  ),
];

const selectOptions = [
  { value: 1, label: 'Option 1' },
  { value: 2, label: 'Option 2' },
  { value: 3, label: 'Option 3' },
];

export const Default = () => {
  return (
    <Stack spacing={2}>
      <Select size="xs" options={selectOptions} />
      <Select size="sm" options={selectOptions} />
      <Select size="md" options={selectOptions} />
      <Select size="lg" options={selectOptions} />
    </Stack>
  );
};
Default.decorators = decorators;

export const SelectWithDefaultValue = () => {
  return <Select options={selectOptions} defaultValue={selectOptions[1]} />;
};
SelectWithDefaultValue.decorators = decorators;

export const SelectWithPlaceholder = () => {
  return (
    <Select
      placeholder="Please select an option"
      noOptionsMessage="There is no options"
    />
  );
};
SelectWithPlaceholder.decorators = decorators;

export const DisabledSelect = () => {
  return <Select isDisabled />;
};
DisabledSelect.decorators = decorators;

export const IsErrorSelect = () => {
  return <Select isError />;
};
IsErrorSelect.decorators = decorators;

export const MultiSelect = () => {
  return <Select isMulti options={selectOptions.slice(0, 2)} />;
};
MultiSelect.decorators = decorators;

export const CreatableSelect = () => {
  return (
    <Select
      isCreatable
      formatCreateLabel={(input) => `Add other option : "${input}"`}
      options={selectOptions.slice(0, 2)}
    />
  );
};
CreatableSelect.decorators = decorators;

export const NotSearchableSelect = () => {
  return <Select isSearchable={false} options={selectOptions.slice(0, 2)} />;
};
NotSearchableSelect.decorators = decorators;

const options = [
  'red',
  'blue',
  'green',
  'orange',
  'purple',
  'lightgreen',
  'lightblue',
  'darkgreen',
  'darkblue',
  'yellow',
  'black',
  'white',
];

const handleLoadOptions = async (inputValue) => {
  // Fake API call
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve(
          options
            .filter((option) => option.startsWith(inputValue))
            .map((option) => ({ label: option, value: option }))
        ),
      300
    )
  );
};

export const AsyncSelect = () => {
  return (
    <Select
      isAsync
      isClearable
      loadOptions={handleLoadOptions}
      debounceDelay={300}
      defaultOptions={options.map((option) => ({
        label: option,
        value: option,
      }))}
    />
  );
};
AsyncSelect.decorators = decorators;

export const AsyncCreatableSelect = () => {
  return (
    <Select
      isAsync
      isCreatable
      isClearable
      loadOptions={handleLoadOptions}
      debounceDelay={300}
      defaultOptions={options.map((option) => ({
        label: option,
        value: option,
      }))}
    />
  );
};
AsyncCreatableSelect.decorators = decorators;

export const SelectWithSomeDisabledOptions = () => {
  return (
    <Select
      options={[
        { value: 1, label: 'Option 1' },
        { value: 2, label: 'Option 2', isDisabled: true },
        { value: 3, label: 'Option 3' },
      ]}
    />
  );
};
SelectWithSomeDisabledOptions.decorators = decorators;
