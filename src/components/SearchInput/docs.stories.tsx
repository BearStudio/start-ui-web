import React, { useState } from 'react';

import { Stack, Text } from '@chakra-ui/react';

import { SearchInput } from '.';

export default {
  title: 'Components/SearchInput',
};

export const Uncontrolled = () => {
  return <SearchInput onChange={(value) => console.log(value)} />;
};

export const Controlled = () => {
  const [value, setValue] = useState<string | undefined>('');

  return (
    <Stack spacing={4}>
      <SearchInput value={value} onChange={setValue} />
      <Text>{value}</Text>
    </Stack>
  );
};

export const Disabled = () => {
  const [value, setValue] = useState<string | undefined>('Search term');

  return <SearchInput value={value} onChange={setValue} isDisabled />;
};

export const DebounceDelay = () => {
  const [value, setValue] = useState<string | undefined>('');
  return (
    <Stack spacing={4}>
      <SearchInput value={value} onChange={setValue} delay={1000} />
      <Text>{value}</Text>
    </Stack>
  );
};
