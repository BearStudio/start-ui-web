import React from 'react';

import { Box, Button, useDisclosure } from '@chakra-ui/react';

import { useToastError, useToastSuccess } from '@/components';

import { ConfirmModal } from '.';

export default {
  title: 'components/ConfirmationModal',
  parameters: {
    docs: {
      description: {
        component:
          'Confirmation modal will allow you to get user confirmation before taking action',
      },
    },
  },
};

export const Default = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const onCancel = () => {
    toastError({
      title: 'Cancel action',
      description: 'The delete action was canceled',
    });
    onClose();
  };

  const onConfirm = () => {
    toastSuccess({
      title: 'Delete action',
      description: 'The delete action was done successfully',
    });
    onClose();
  };
  return (
    <Box>
      <Button onClick={onOpen}>Open Modal</Button>
      <ConfirmModal
        onCancel={onCancel}
        onConfirm={onConfirm}
        onClose={onClose}
        isOpen={isOpen}
        title="Confirm delete"
      >
        Are you sure you want to delete this user?
      </ConfirmModal>
    </Box>
  );
};
