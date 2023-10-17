import React, { useState } from 'react';

import { Button, Heading, Stack } from '@chakra-ui/react';
import { Meta } from '@storybook/react';

import { SheetModal } from '.';

export default {
  title: 'components/SheetModal',
} satisfies Meta;

export const Default = () => {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <SheetModal isOpen={isOpen} onClose={() => setOpen(false)}>
        <Stack spacing={4}>
          <Heading size="sm">Sheet on mobile</Heading>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </Stack>
      </SheetModal>
    </>
  );
};
