import React from 'react';

import { Box, Button, Flex } from '@chakra-ui/react';
import { Meta } from '@storybook/react';
import { toast } from 'sonner';

import { toastCustom } from '@/components/Toast';

export default {
  title: 'Components/Toast',
  decorators: [
    (Story) => (
      <Box h="10rem">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta;

export const Default = () => {
  const handleOpenToast = (props: { status: 'success' | 'error' | 'info' }) => {
    toastCustom({
      status: props.status,
      title: 'This is a toast',
    });
  };

  return (
    <Flex gap={4}>
      <Button size="md" onClick={() => handleOpenToast({ status: 'success' })}>
        Success toast
      </Button>
      <Button size="md" onClick={() => handleOpenToast({ status: 'error' })}>
        Error toast
      </Button>
      <Button size="md" onClick={() => handleOpenToast({ status: 'info' })}>
        Info toast
      </Button>
    </Flex>
  );
};

export const WithDescription = () => {
  const handleOpenToast = (props: { status: 'success' | 'error' | 'info' }) => {
    toastCustom({
      status: props.status,
      title: 'This is a toast',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis id porta lacus. Nunc tellus ipsum, blandit commodo neque at, eleifend facilisis arcu. Phasellus nec pretium sapien.',
    });
  };
  return (
    <Flex gap={4}>
      <Button size="md" onClick={() => handleOpenToast({ status: 'success' })}>
        Success toast with description
      </Button>
      <Button size="md" onClick={() => handleOpenToast({ status: 'error' })}>
        Error toast with description
      </Button>
      <Button size="md" onClick={() => handleOpenToast({ status: 'info' })}>
        Info toast with description
      </Button>
    </Flex>
  );
};

export const WithActions = () => {
  const handleOpenToast = (props: { status: 'success' | 'error' | 'info' }) => {
    toastCustom({
      status: props.status,
      title: 'This is a toast',
      actions: (
        <Button onClick={() => toast.dismiss()}>Close all toasts</Button>
      ),
    });
  };
  return (
    <Flex gap={4}>
      <Button size="md" onClick={() => handleOpenToast({ status: 'success' })}>
        Success toast with actions
      </Button>
      <Button size="md" onClick={() => handleOpenToast({ status: 'error' })}>
        Error toast with actions
      </Button>
      <Button size="md" onClick={() => handleOpenToast({ status: 'info' })}>
        Info toast with with actions
      </Button>
    </Flex>
  );
};

export const HideIcon = () => {
  const handleOpenToast = (props: { status: 'success' | 'error' | 'info' }) => {
    toastCustom({
      status: props.status,
      title: 'This is a toast',
      hideIcon: true,
    });
  };
  return (
    <Flex gap={4}>
      <Button size="md" onClick={() => handleOpenToast({ status: 'success' })}>
        Success toast without icon
      </Button>
      <Button size="md" onClick={() => handleOpenToast({ status: 'error' })}>
        Error toast without icon
      </Button>
      <Button size="md" onClick={() => handleOpenToast({ status: 'info' })}>
        Info toast without icon
      </Button>
    </Flex>
  );
};
