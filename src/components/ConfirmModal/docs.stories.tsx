import React from 'react';

import { Button } from '@chakra-ui/react';

import { ConfirmModal } from '.';

export default {
  title: 'Components/ConfirmModal',
};

export const Default = () => {
  return (
    <ConfirmModal onConfirm={() => alert('Custom Action')}>
      <Button>Trigger Modal</Button>
    </ConfirmModal>
  );
};

export const WithCustomParameters = () => {
  return (
    <ConfirmModal
      title="ConfirmModal Title"
      message="Custom message"
      onConfirm={() => alert('Custom Action')}
      confirmText="Custom Text"
      confirmVariant="@danger"
    >
      <Button>Trigger Modal</Button>
    </ConfirmModal>
  );
};

export const EnabledFalse = () => {
  return (
    <ConfirmModal onConfirm={() => alert('Custom Action')} isEnabled={false}>
      <Button>Trigger Action</Button>
    </ConfirmModal>
  );
};
