import { Button } from '@chakra-ui/react';

import { useDebouncedCallback } from '.';

export default {
  title: 'Hooks/useDebouncedCallback',
};

export const Default = () => {
  const { trigger } = useDebouncedCallback({
    callback: () => {
      alert('debounced alert');
    },
  });
  return (
    <Button
      onClick={() => {
        trigger();
      }}
    >
      Debounced alert
    </Button>
  );
};

export const WithData = () => {
  const { trigger, data } = useDebouncedCallback({
    callback: () => {
      return `Debounced data (${new Date()})`;
    },
  });
  return (
    <>
      <Button
        onClick={() => {
          trigger();
        }}
      >
        Debounced data
      </Button>
      {data}
    </>
  );
};
