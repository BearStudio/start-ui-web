import { useState } from 'react';

import { Input } from '@chakra-ui/react';

import { useDebouncedValue } from '.';

export default {
  title: 'Hooks/useDebouncedValue',
};

export const Default = () => {
  const [value, setValue] = useState('');
  const debouncedValue = useDebouncedValue(value);
  return (
    <>
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      {debouncedValue}
    </>
  );
};
