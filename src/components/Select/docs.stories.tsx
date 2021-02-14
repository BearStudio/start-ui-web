import React from 'react';

import { Box, Button, Flex } from '@chakra-ui/react';

import { Select } from '.';

export default {
  title: 'components/Select',
};

export const Default = () => {
  return (
    <Select
      options={[
        { value: 1, label: 'Option 1' },
        { value: 2, label: 'Option 2' },
        { value: 3, label: 'Option 3' },
      ]}
    />
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
      isMulti
      options={[
        { value: 1, label: 'Option 1' },
        { value: 2, label: 'Option 2' },
        { value: 3, label: 'Option 3' },
      ]}
      defaultValue={[
        { value: 2, label: 'Option 2' },
        { value: 3, label: 'Option 3' },
      ]}
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

export const SelectWithCustomColors = () => {
  const [isError, setIsError] = React.useState(false);

  const toggleError = () => {
    setIsError((x) => !x);
  };

  return (
    <Flex>
      <Select
        containerProps={{
          flexGrow: 1,
        }}
        focusBorderColor="info.500"
        isError={isError}
        errorBorderColor="danger.200"
        optionsColor={{
          hover: 'primary.100',
          selected: 'primary.500',
          active: 'danger.500',
        }}
        options={[
          { label: 'Option 1', value: 'option-1' },
          { label: 'Option 2', value: 'option-2' },
        ]}
      />
      <Button ml={3} onClick={toggleError}>
        Toggle isError
      </Button>
    </Flex>
  );
};
SelectWithCustomColors.decorators = [
  (Story) => (
    <Box h="24rem">
      <Story />
    </Box>
  ),
];
