import React from 'react';

import { Button } from '@chakra-ui/react';

import { ConfirmPopover } from '.';

export default {
  title: 'Components/ConfirmPopover',
};

export const Default = () => {
  return (
    <ConfirmPopover onConfirm={() => alert('Custom Action')}>
      <Button>Trigger Popover</Button>
    </ConfirmPopover>
  );
};

export const WithCustomParameters = () => {
  return (
    <ConfirmPopover
      title="Popover Title"
      message="Custom message"
      onConfirm={() => alert('Custom Action')}
      confirmText="Custom Text"
      confirmVariant="@danger"
    >
      <Button>Trigger Popover</Button>
    </ConfirmPopover>
  );
};

export const EnabledFalse = () => {
  return (
    <ConfirmPopover onConfirm={() => alert('Custom Action')} isEnabled={false}>
      <Button>Trigger Action</Button>
    </ConfirmPopover>
  );
};
