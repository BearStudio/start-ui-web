import React from 'react';

import { Box, Stack } from '@chakra-ui/react';

import { Select } from '.';

export default {
  title: 'components/Select',
};

export const Default = () => {
  return (
    <Stack spacing={2}>
      <Select
        size="xs"
        options={[
          { value: 1, label: 'Option 1' },
          { value: 2, label: 'Option 2' },
          { value: 3, label: 'Option 3' },
        ]}
      />
      <Select
        size="sm"
        options={[
          { value: 1, label: 'Option 1' },
          { value: 2, label: 'Option 2' },
          { value: 3, label: 'Option 3' },
        ]}
      />
      <Select
        size="md"
        options={[
          { value: 1, label: 'Option 1' },
          { value: 2, label: 'Option 2' },
          { value: 3, label: 'Option 3' },
        ]}
      />
      <Select
        size="lg"
        options={[
          { value: 1, label: 'Option 1' },
          { value: 2, label: 'Option 2' },
          { value: 3, label: 'Option 3' },
        ]}
      />
    </Stack>
  );
};
Default.decorators = [
  (Story) => (
    <Box h="24rem">
      <Story />
    </Box>
  ),
];

export const SelectWithDefaultValue = () => {
  return (
    <Select
      options={[
        { value: 1, label: 'Option 1' },
        { value: 2, label: 'Option 2' },
        { value: 3, label: 'Option 3' },
      ]}
      defaultValue={{ value: 2, label: 'Option 2' }}
    />
  );
};
SelectWithDefaultValue.decorators = [
  (Story) => (
    <Box h="24rem">
      <Story />
    </Box>
  ),
];

export const SelectWithPlaceholder = () => {
  return (
    <Select
      placeholder="Please select an option"
      noOptionsMessage="There is no options"
    />
  );
};
SelectWithPlaceholder.decorators = [
  (Story) => (
    <Box h="24rem">
      <Story />
    </Box>
  ),
];

export const DisabledSelect = () => {
  return <Select isDisabled />;
};
DisabledSelect.decorators = [
  (Story) => (
    <Box h="24rem">
      <Story />
    </Box>
  ),
];

export const IsErrorSelect = () => {
  return <Select isError />;
};
IsErrorSelect.decorators = [
  (Story) => (
    <Box h="24rem">
      <Story />
    </Box>
  ),
];

export const MultiSelect = () => {
  return (
    <Select
      isMulti
      options={[
        { value: 1, label: 'Option 1' },
        { value: 2, label: 'Option 2' },
      ]}
    />
  );
};
MultiSelect.decorators = [
  (Story) => (
    <Box h="24rem">
      <Story />
    </Box>
  ),
];

export const CreatableSelect = () => {
  return (
    <Select
      isCreatable
      formatCreateLabel={(input) => `Add other option : "${input}"`}
      options={[
        { value: 1, label: 'Option 1' },
        { value: 2, label: 'Option 2' },
      ]}
    />
  );
};
CreatableSelect.decorators = [
  (Story) => (
    <Box h="24rem">
      <Story />
    </Box>
  ),
];

export const NotSearchableSelect = () => {
  return (
    <Select
      isSearchable={false}
      options={[
        { value: 1, label: 'Option 1' },
        { value: 2, label: 'Option 2' },
      ]}
    />
  );
};
NotSearchableSelect.decorators = [
  (Story) => (
    <Box h="24rem">
      <Story />
    </Box>
  ),
];

export const AsyncSelect = () => {
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
    return await new Promise((resolve) =>
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
AsyncSelect.decorators = [
  (Story) => (
    <Box h="24rem">
      <Story />
    </Box>
  ),
];

export const AsyncCreatableSelect = () => {
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
    return await new Promise((resolve) =>
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
AsyncCreatableSelect.decorators = [
  (Story) => (
    <Box h="24rem">
      <Story />
    </Box>
  ),
];

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
SelectWithSomeDisabledOptions.decorators = [
  (Story) => (
    <Box h="24rem">
      <Story />
    </Box>
  ),
];
