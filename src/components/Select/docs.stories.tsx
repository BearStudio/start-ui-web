import React from 'react';

import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Stack,
  useDisclosure,
} from '@chakra-ui/react';

import { Select } from '.';

export default {
  title: 'components/Select',
  decorators: [
    (Story: TODO) => (
      <Box h="24rem">
        <Story />
      </Box>
    ),
  ],
};

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

export const SelectWithDefaultValue = () => {
  return <Select options={selectOptions} defaultValue={selectOptions[1]} />;
};

export const SelectWithPlaceholder = () => {
  return (
    <Select
      placeholder="Please select an option"
      noOptionsMessage={() => 'There is no options'}
    />
  );
};

export const DisabledSelect = () => {
  return <Select isDisabled />;
};

export const IsErrorSelect = () => {
  return <Select isError />;
};

export const MultiSelect = () => {
  return <Select isMulti options={selectOptions.slice(0, 2)} />;
};

export const CreatableSelect = () => {
  return (
    <Select
      isCreatable
      formatCreateLabel={(input) => `Add other option : "${input}"`}
      options={selectOptions.slice(0, 2)}
    />
  );
};

export const NotSearchableSelect = () => {
  return <Select isSearchable={false} options={selectOptions.slice(0, 2)} />;
};

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

const handleLoadOptions = async (inputValue: unknown) => {
  // Fake API call
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve(
          options
            .filter((option) => option.startsWith(String(inputValue)))
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
      loadingMessage={({ inputValue }) => `Loading ${inputValue}...`}
    />
  );
};

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

export const SelectInPopover = () => {
  return (
    <Popover>
      <PopoverTrigger>
        <Button>Trigger</Button>
      </PopoverTrigger>
      <Portal>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>Confirmation!</PopoverHeader>
          <PopoverBody>
            <Select options={selectOptions} />
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

export const SelectInModal = () => {
  const modal = useDisclosure();
  return (
    <>
      <Button onClick={modal.onOpen}>Open Modal</Button>

      <Modal isOpen={modal.isOpen} onClose={modal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Select options={selectOptions} />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={modal.onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
